import { FC, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { Currency, defTokens, LayoutKey } from "utils/constants";
import { ChainProps, TokenProps, VaultProps } from "utils/interfaces";
import {
  getStoredAddresses,
  getStoredVaults,
  setStoredAddresses,
  setStoredVaults,
} from "utils/storage";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import Header from "components/header";
import SplashScreen from "components/splash-screen";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";
import DeleteVault from "modals/delete-vault";
import LogoutVault from "modals/logout-vault";
import RenameVault from "modals/rename-vault";
import VaultSettings from "modals/vault-settings";
import SharedSettings from "modals/shared-settings";
import JoinAirDrop from "modals/join-airdrop";
import ManageAirDrop from "modals/manage-airdrop";
import VaultProvider from "utils/vault-provider";

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
                              ? vaultProvider.sortChain({
                                  ...chain,
                                  coins: chain.coins.filter(
                                    ({ ticker }) => token.ticker !== ticker
                                  ),
                                })
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
                        ? vault.chains.map((chain) =>
                            chain.name === selectedChain.name
                              ? {
                                  ...chain,
                                  coins: [...chain.coins, newToken],
                                }
                              : chain
                          )
                        : [
                            ...vault.chains,
                            {
                              address: newToken.address,
                              balance: 0,
                              coins: [newToken],
                              hexPublicKey: newToken.hexPublicKey,
                              name: newToken.chain,
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
                    vaultProvider
                      .getValues([newToken], Currency.USD)
                      .then(([{ value }]) => {
                        newToken.value = value;

                        setState((prevState) => {
                          const vaults = prevState.vaults.map((item) =>
                            vaultProvider.compareVault(item, vault)
                              ? {
                                  ...item,
                                  chains: vault.chains.map((chain) =>
                                    chain.name === selectedChain.name
                                      ? vaultProvider.sortChain({
                                          ...chain,
                                          coins: chain.coins.map((coin) =>
                                            coin.ticker === newToken.ticker
                                              ? {
                                                  ...coin,
                                                  balance,
                                                  value,
                                                }
                                              : coin
                                          ),
                                        })
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

        navigate(constantPaths.default.import, { replace: true });

        return { ...prevState };
      }
    });
  };

  const prepareChain = (chain: ChainProps, vault: VaultProps): void => {
    vaultProvider.prepareChain(chain, Currency.USD).then((chain) => {
      setState((prevState) => {
        const vaults = prevState.vaults.map((item) =>
          vaultProvider.compareVault(item, vault)
            ? {
                ...item,
                chains: item.chains.map((item) =>
                  item.name === chain.name
                    ? vaultProvider.sortChain(chain)
                    : item
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

  const componentDidMount = (): void => {
    const vaults = getStoredVaults();

    if (vaults.length) {
      const promises = vaults.map((vault) =>
        api.vault.get(vault).then((vault) => {
          if (vault && !vault.chains.length) {
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
                  hexPublicKey,
                })
              );

              return vault;
            });
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
          navigate(constantPaths.default.import, { replace: true });
        }
      });
    } else {
      navigate(constantPaths.default.import, { replace: true });
    }
  };

  useEffect(componentDidMount, []);

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
            prepareChain,
            toggleToken,
            updatePositions,
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
