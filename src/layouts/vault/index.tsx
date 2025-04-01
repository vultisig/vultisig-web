import { FC, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {
  Currency,
  LayoutKey,
  balanceAPI,
  defTokens,
  oneInchRef,
} from "utils/constants";
import {
  ChainProps,
  CoinParams,
  CoinProps,
  TokenProps,
  VaultProps,
} from "utils/interfaces";
import {
  getStoredAddresses,
  getStoredVaults,
  setStoredAddresses,
  setStoredVaults,
} from "utils/storage";
import constantPaths from "routes/constant-paths";
import api from "utils/api";
import PositionProvider from "utils/position-provider";
import VaultProvider from "utils/vault-provider";

import Header from "components/header";
import SplashScreen from "components/splash-screen";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";
import DeleteVault from "modals/delete-vault";
import LogoutVault from "modals/logout-vault";
import RenameVault from "modals/rename-vault";
import ReferalCode from "modals/referal-code";
import VaultSettings from "modals/vault-settings";
import SharedSettings from "modals/shared-settings";
import JoinAirDrop from "modals/join-airdrop";
import ManageAirDrop from "modals/manage-airdrop";

interface InitialState {
  tokens: TokenProps[];
  vaults: VaultProps[];
  vault?: VaultProps;
}

const Component: FC = () => {
  const initialState: InitialState = {
    tokens: defTokens,
    vaults: [],
  };
  const [state, setState] = useState(initialState);
  const { tokens, vault, vaults } = state;
  const navigate = useNavigate();
  const vaultProvider = new VaultProvider();

  const discoverAssets = (token: CoinParams & CoinProps, vault: VaultProps) => {
    const oneInchId = oneInchRef[token.chain];

    if (oneInchId) {
      const path = balanceAPI[token.chain];

      api.discovery.tokens(path, token.address).then((discoveredTokens) => {
        api.coin
          .getInfo(
            oneInchId,
            discoveredTokens.map(({ contractAddress }) => contractAddress)
          )
          .then((updatedTokens) => {
            const promises = discoveredTokens
              .filter(({ contractAddress }) => !!updatedTokens[contractAddress])
              .map(({ contractAddress, tokenBalance }) =>
                api.coin.cmc(contractAddress).then((cmcId) => {
                  const decimals = updatedTokens[contractAddress].decimals;

                  return {
                    address: token.address,
                    balance:
                      parseInt(tokenBalance, 16) / Math.pow(10, decimals),
                    chain: token.chain,
                    cmcId,
                    contractAddress: contractAddress,
                    decimals,
                    hexPublicKey:
                      token.hexPublicKey === "ECDSA"
                        ? vault.publicKeyEcdsa
                        : vault.publicKeyEddsa,
                    isNative: false,
                    logo: updatedTokens[contractAddress].logoURI || "",
                    ticker: updatedTokens[contractAddress].symbol,
                  };
                })
              );

            Promise.all(promises).then((coins) => {
              const promises = coins
                .filter(({ cmcId }) => cmcId)
                .map(({ balance, ...coin }) =>
                  api.coin
                    .add(vault, coin)
                    .catch(() => 0)
                    .then((id) => ({ ...coin, balance, id, value: 0 }))
                );

              Promise.all(promises).then((coins) => {
                const validCoins = coins.filter(({ id }) => id);

                vaultProvider
                  .getValues(validCoins, Currency.USD)
                  .then((newCoins) => {
                    setState((prevState) => {
                      const vaults = prevState.vaults.map((item) =>
                        vaultProvider.compareVault(item, vault)
                          ? {
                              ...item,
                              chains: item.chains.map((chain) =>
                                chain.name === token.chain
                                  ? {
                                      ...vaultProvider.sortChain({
                                        ...chain,
                                        coins: [...chain.coins, ...newCoins],
                                      }),
                                    }
                                  : chain
                              ),
                            }
                          : item
                      );

                      setStoredVaults(vaults);

                      return {
                        ...prevState,
                        vault: vaults.find(({ isActive }) => isActive),
                        vaults,
                      };
                    });
                  });
              });
            });
          });
      });
    }
  };

  const toggleToken = (token: TokenProps, vault: VaultProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      const selectedChain = vault.chains.find(
        ({ name }) => name === token.chain
      );

      const selectedCoin = selectedChain?.coins.find(
        ({ ticker }) => ticker === token.ticker
      );

      if (selectedCoin) {
        api.coin
          .del(vault, selectedCoin)
          .then(() => {
            setState((prevState) => {
              const vaults = prevState.vaults.map((item) =>
                vaultProvider.compareVault(item, vault)
                  ? {
                      ...item,
                      chains: token.isNative
                        ? vault.chains.filter(
                            ({ name }) => name !== token.chain
                          )
                        : vault.chains.map((chain) =>
                            chain.name === token.chain
                              ? {
                                  ...chain,
                                  ...vaultProvider.sortChain({
                                    ...chain,
                                    coins: chain.coins.filter(
                                      ({ ticker }) => token.ticker !== ticker
                                    ),
                                  }),
                                }
                              : chain
                          ),
                    }
                  : item
              );

              setStoredVaults(vaults);

              return {
                ...prevState,
                vault: vaults.find(({ isActive }) => isActive),
                vaults,
              };
            });

            resolve();
          })
          .catch(reject);
      } else {
        vaultProvider
          .addToken(token, vault)
          .then((newToken) => {
            setState((prevState) => {
              const vaults = prevState.vaults.map((item) =>
                vaultProvider.compareVault(item, vault)
                  ? {
                      ...item,
                      chains: selectedChain
                        ? item.chains.map((chain) =>
                            chain.name === selectedChain.name
                              ? {
                                  ...chain,
                                  coins: [...chain.coins, newToken],
                                }
                              : chain
                          )
                        : [
                            ...item.chains,
                            {
                              address: newToken.address,
                              balance: 0,
                              coins: [newToken],
                              hexPublicKey: newToken.hexPublicKey,
                              name: newToken.chain,
                              nfts: [],
                            },
                          ],
                    }
                  : item
              );

              setStoredVaults(vaults);

              return {
                ...prevState,
                vault: vaults.find(({ isActive }) => isActive),
                vaults,
              };
            });

            if (selectedChain) {
              vaultProvider
                .getBalance(
                  newToken.address,
                  newToken.chain,
                  newToken.contractAddress,
                  newToken.decimals,
                  newToken.isNative,
                  newToken.ticker
                )
                .then((balance) => {
                  if (balance) {
                    newToken.balance = balance;

                    vaultProvider
                      .getValues([newToken], Currency.USD)
                      .then(([{ value }]) => {
                        newToken.value = value;

                        setState((prevState) => {
                          const vaults = prevState.vaults.map((item) =>
                            vaultProvider.compareVault(item, vault)
                              ? {
                                  ...item,
                                  chains: item.chains.map((chain) =>
                                    chain.name === selectedChain.name
                                      ? {
                                          ...vaultProvider.sortChain({
                                            ...chain,
                                            coins: chain.coins.map((coin) =>
                                              coin.ticker === newToken.ticker
                                                ? { ...coin, balance, value }
                                                : coin
                                            ),
                                          }),
                                        }
                                      : chain
                                  ),
                                }
                              : item
                          );

                          setStoredVaults(vaults);

                          return {
                            ...prevState,
                            vault: vaults.find(({ isActive }) => isActive),
                            vaults,
                          };
                        });
                      });
                  }
                });
            } else {
              discoverAssets(newToken, vault);
            }

            resolve();
          })
          .catch(reject);
      }
    });
  };

  const getTokens = (chain: ChainProps): Promise<void> => {
    return new Promise((resolve) => {
      vaultProvider.getTokens(chain).then((tokens) => {
        setState((prevState) => ({ ...prevState, tokens }));

        resolve();
      });
    });
  };

  const deleteVault = (vault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.filter(({ uid }) => uid !== vault.uid);
      const addresses = getStoredAddresses();

      delete addresses[vault.publicKeyEcdsa];
      delete addresses[vault.publicKeyEddsa];

      setStoredAddresses(addresses);

      if (vaults.length) {
        const vault = vaults.find(({ isActive }) => isActive);

        if (vault) {
          setStoredVaults(vaults);

          return { ...prevState, vault, vaults };
        } else {
          const modifiedVaults = vaults.map((vault, index) => ({
            ...vault,
            isActive: !index,
          }));
          const [activeVault] = modifiedVaults;

          setStoredVaults(modifiedVaults);

          return { ...prevState, vault: activeVault, vaults: modifiedVaults };
        }
      } else {
        setStoredVaults([]);

        navigate(constantPaths.default.leaderboard, { replace: true });

        return { ...prevState };
      }
    });
  };

  const prepareVault = (vault: VaultProps) => {
    const updatedVault = {} as VaultProps;
    const _assets = vault.chains.filter(({ coinsUpdated }) => !coinsUpdated);
    const _nfts = vault.chains.filter(({ nftsUpdated }) => !nftsUpdated);

    if (_assets.length) {
      if (!vault.assetsUpdating) {
        updatedVault.assetsUpdating = true;

        _assets.forEach((item) =>
          vaultProvider
            .prepareChain(item, Currency.USD)
            .then((chain) => updateChain(chain, vault))
        );
      }
    } else if (vault.assetsUpdating) {
      updatedVault.assetsUpdating = false;
    }

    if (_nfts.length) {
      if (!vault.nftsUpdating) {
        updatedVault.nftsUpdating = true;

        _nfts.forEach((item) =>
          vaultProvider
            .prepareNFT(item)
            .then((chain) => updateChain(chain, vault))
        );
      }
    } else if (vault.nftsUpdating) {
      updatedVault.nftsUpdating = false;
    }

    if (!vault.positionsUpdating) {
      if (!vault.positions.updated) {
        const positionProvider = new PositionProvider(vault);

        updatedVault.positionsUpdating = true;

        positionProvider.getPrerequisites().then(() => {
          Promise.all([
            positionProvider.getLiquidityPositions().then((positions) => {
              updatePositions({ ...vault, positions });
            }),
            positionProvider.getMayaBond().then((positions) => {
              updatePositions({ ...vault, positions });
            }),
            positionProvider.getRuneProvider().then((positions) => {
              updatePositions({ ...vault, positions });
            }),
            positionProvider.getSaverPositions().then((positions) => {
              updatePositions({ ...vault, positions });
            }),
            positionProvider.getThorBond().then((positions) => {
              updatePositions({ ...vault, positions });
            }),
            positionProvider.getTGTStake().then((positions) => {
              updatePositions({ ...vault, positions });
            }),
            positionProvider.getWewePositions().then((positions) => {
              updatePositions({ ...vault, positions });
            }),
          ]).then(() => {
            updatePositions({ ...vault, positions: { updated: true } });
          });
        });
      }
    } else if (vault.positions.updated) {
      updatedVault.positionsUpdating = false;
    }

    if (Object.keys(updatedVault).length)
      updateVault({ ...vault, ...updatedVault });
  };

  const updateChain = (chain: ChainProps, vault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        vaultProvider.compareVault(item, vault)
          ? {
              ...item,
              chains: item.chains.map((item) =>
                item.name === chain.name ? { ...item, ...chain } : item
              ),
            }
          : item
      );

      setStoredVaults(vaults);

      return {
        ...prevState,
        vault: vaults.find(({ isActive }) => isActive),
        vaults,
      };
    });
  };

  const updatePositions = (vault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        vaultProvider.compareVault(item, vault)
          ? {
              ...item,
              positions: { ...item.positions, ...vault.positions },
            }
          : item
      );

      setStoredVaults(vaults);

      return {
        ...prevState,
        vault: vaults.find(({ isActive }) => isActive),
        vaults,
      };
    });
  };

  const updateVault = (vault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        vaultProvider.compareVault(item, vault)
          ? vault
          : {
              ...item,
              isActive: vault.isActive ? false : item.isActive,
            }
      );

      setStoredVaults(vaults);

      return {
        ...prevState,
        vault: vaults.find(({ isActive }) => isActive),
        vaults,
      };
    });
  };

  const componentDidUpdate = (): void => {
    if (vault) prepareVault(vault);
  };

  const componentDidMount = (): void => {
    const vaults = getStoredVaults();

    if (vaults.length) {
      const promises = vaults.map((vault) =>
        api.vault.get(vault).then((vault) => {
          if (vault) {
            if (vault.chains.length) {
              return {
                ...vault,
                chains: vault.chains.map((chain) => ({ ...chain, nfts: [] })),
              };
            } else {
              const promises = defTokens
                .filter((coin) => coin.isDefault)
                .map((coin) => vaultProvider.addToken(coin, vault));

              return Promise.all(promises).then((chains) => {
                vault.chains = chains.map(
                  ({
                    address,
                    balance,
                    chain,
                    cmcId,
                    contractAddress,
                    decimals,
                    hexPublicKey,
                    id,
                    isNative,
                    logo,
                    ticker,
                    value,
                  }) => ({
                    address,
                    balance: 0,
                    coins: [
                      {
                        balance,
                        cmcId,
                        contractAddress,
                        decimals,
                        id,
                        isNative,
                        logo,
                        ticker,
                        value,
                      },
                    ],
                    name: chain,
                    nfts: [],
                    hexPublicKey,
                  })
                );

                return vault;
              });
            }
          } else {
            return vault;
          }
        })
      );

      Promise.all(promises).then((updatedVaults) => {
        const vaults = updatedVaults.filter((vault) => vault !== undefined);

        if (vaults.length) {
          const vault = vaults.find(({ isActive }) => isActive);

          if (vault) {
            setState((prevState) => ({ ...prevState, vault, vaults }));

            setStoredVaults(vaults);
          } else {
            const modifiedVaults = vaults.map((vault, index) => ({
              ...vault,
              isActive: !index,
            }));
            const [activeVault] = modifiedVaults;

            setState((prevState) => ({
              ...prevState,
              vault: activeVault,
              vaults: modifiedVaults,
            }));

            setStoredVaults(modifiedVaults);
          }
        } else {
          setStoredVaults([]);

          navigate(constantPaths.default.leaderboard, { replace: true });
        }
      });
    } else {
      navigate(constantPaths.default.leaderboard, { replace: true });
    }
  };

  useEffect(componentDidMount, []);
  useEffect(componentDidUpdate, [vault]);

  return vault ? (
    <>
      <div className="layout">
        <Header
          layout={LayoutKey.VAULT}
          vault={vault}
          updateVault={updateVault}
        />
        <Outlet
          context={{
            deleteVault,
            getTokens,
            toggleToken,
            updateVault,
            layout: LayoutKey.VAULT,
            tokens,
            vault,
            vaults,
          }}
        />
      </div>
      <ChangeCurrency />
      <ChangeLanguage />
      <ManageAirDrop updateVault={updateVault} vaults={vaults} />
      <RenameVault updateVault={updateVault} vault={vault} />
      <ReferalCode vault={vault} />
      <DeleteVault deleteVault={deleteVault} vault={vault} />
      <LogoutVault deleteVault={deleteVault} vault={vault} />
      <JoinAirDrop vault={vault} />
      <VaultSettings vault={vault} />
      <SharedSettings vault={vault} />
    </>
  ) : (
    <SplashScreen />
  );
};

export default Component;
