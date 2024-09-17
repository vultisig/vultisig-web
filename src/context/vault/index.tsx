import {
  FC,
  ReactNode,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import { initWasm, WalletCore } from "@trustwallet/wallet-core";

import { useBaseContext } from "context/base";
import {
  Chain,
  Currency,
  defTokens,
  errorKey,
  oneInchRef,
} from "utils/constants";
import {
  ChainProps,
  CoinParams,
  CoinProps,
  CoinRef,
  TokenProps,
  VaultProps,
} from "utils/interfaces";
import { getBalance, getValue, getVaults, setVaults } from "utils/vault";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import Header from "components/header";
import Preloader from "components/preloader";
import SplashScreen from "components/splash-screen";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";
import DeleteVault from "modals/delete-vault";
import RenameVault from "modals/rename-vault";
import VaultSettings from "modals/vault-settings";

interface VaultContext {
  fetchTokens: (chain: ChainProps) => Promise<void>;
  setVault: (vault: VaultProps) => void;
  delVault: (vault: VaultProps) => void;
  useVault: (vault: VaultProps) => void;
  toggleCoin: (coin: TokenProps, vault: VaultProps) => Promise<void>;
  tokens: TokenProps[];
  vault?: VaultProps;
  vaults: VaultProps[];
}

interface InitialState {
  tokens: TokenProps[];
  core?: WalletCore;
  loaded: boolean;
  loading: boolean;
  vaults: VaultProps[];
  vault?: VaultProps;
  wcRef: CoinRef;
}

const VaultContext = createContext<VaultContext | undefined>(undefined);

const Component: FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: InitialState = {
    tokens: defTokens,
    loaded: false,
    loading: false,
    vaults: [],
    wcRef: {},
  };
  const [state, setState] = useState(initialState);
  const { core, loaded, loading, tokens, vault, vaults, wcRef } = state;
  const { setCurrency, currency } = useBaseContext();
  const navigate = useNavigate();

  const initCore = (): Promise<{ core: WalletCore; wcRef: CoinRef }> => {
    return new Promise((resolve, reject) => {
      if (core) {
        resolve({ core, wcRef });
      } else {
        initWasm()
          .then((core) => {
            const wcRef = {
              [Chain.ARBITRUM]: core.CoinType.arbitrum,
              [Chain.AVALANCHE]: core.CoinType.avalancheCChain,
              [Chain.BASE]: core.CoinType.base,
              [Chain.BITCOIN]: core.CoinType.bitcoin,
              [Chain.BITCOINCASH]: core.CoinType.bitcoinCash,
              [Chain.BLAST]: core.CoinType.blast,
              [Chain.BSCCHAIN]: core.CoinType.smartChain,
              [Chain.CRONOSCHAIN]: core.CoinType.cronosChain,
              [Chain.DASH]: core.CoinType.dash,
              [Chain.DOGECOIN]: core.CoinType.dogecoin,
              [Chain.DYDX]: core.CoinType.dydx,
              [Chain.ETHEREUM]: core.CoinType.ethereum,
              [Chain.GAIACHAIN]: core.CoinType.cosmos,
              [Chain.KUJIRA]: core.CoinType.kujira,
              [Chain.LITECOIN]: core.CoinType.litecoin,
              [Chain.MAYACHAIN]: core.CoinType.thorchain,
              [Chain.OPTIMISM]: core.CoinType.optimism,
              [Chain.POLKADOT]: core.CoinType.polkadot,
              [Chain.POLYGON]: core.CoinType.polygon,
              [Chain.SOLANA]: core.CoinType.solana,
              [Chain.SUI]: core.CoinType.sui,
              [Chain.THORCHAIN]: core.CoinType.thorchain,
              [Chain.ZKSYNC]: core.CoinType.zksync,
            };

            setState((prevState) => ({ ...prevState, core, wcRef }));

            resolve({ core, wcRef });
          })
          .catch(() => {
            reject(errorKey.FAIL_TO_INIT_WASM);
          });
      }
    });
  };

  const changeCurrency = (currency: Currency): void => {
    if (!loading && vault) {
      setState((prevState) => ({ ...prevState, loading: true }));

      const coins = vault.chains.flatMap(({ coins }) => coins);

      getValue(coins, currency).then((coins) => {
        setCurrency(currency);

        setState((prevState) => ({
          ...prevState,
          currency,
          loading: false,
          vault: {
            ...vault,
            chains: vault.chains.map((chain) => ({
              ...chain,
              coins: chain.coins.map(
                (coin) => coins.find(({ id }) => id === coin.id) || coin
              ),
            })),
          },
        }));
      });
    }
  };

  const fetchTokens = (chain: ChainProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      const token = defTokens.find((item) => item.chain === chain.name);
      const tokens: TokenProps[] = [];

      let id = oneInchRef[chain.name];

      if (token) {
        if (id) {
          api
            .oneInch(id)
            .then(({ data }) => {
              Object.entries(data.tokens).forEach(([key, value]) => {
                const notFound =
                  defTokens.findIndex(
                    (token) => token.contractAddress === key
                  ) < 0;

                if (notFound) {
                  tokens.push({
                    chain: chain.name,
                    cmcId: 0,
                    contractAddress: key,
                    decimals: value.decimals,
                    hexPublicKey: token.hexPublicKey,
                    isDefault: false,
                    isLocally: false,
                    isNative: false,
                    logo: value.logoURI,
                    ticker: value.symbol,
                  });
                }
              });

              setState((prevState) => ({
                ...prevState,
                tokens: [...defTokens, ...tokens],
              }));

              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        } else if (token.chain === Chain.SOLANA) {
          api.discovery
            .spl(chain.address)
            .then(({ data }) => {
              if (data?.result?.value && data.result.value.length) {
                const tokens: TokenProps[] = data.result.value
                  .filter((item) =>
                    item?.account?.data?.parsed?.info
                      ? !item.account.data.parsed.info.isNative &&
                        item.account.data.parsed.info.mint
                      : false
                  )
                  .map((item) => ({
                    chain: Chain.SOLANA,
                    cmcId: 0,
                    contractAddress: item.account.data.parsed.info.mint,
                    decimals:
                      item.account.data.parsed.info.tokenAmount.decimals,
                    hexPublicKey: "EDDSA",
                    isDefault: false,
                    isLocally: false,
                    isNative: false,
                    logo: "",
                    ticker: "",
                  }));

                if (tokens.length) {
                  api.discovery.info
                    .spl(tokens.map(({ contractAddress }) => contractAddress))
                    .then(({ data }) => {
                      const promises = tokens.map((token) => getCMC(token));

                      Promise.all(promises).then((numbers) => {
                        tokens.forEach((token, index) => {
                          const item = data[token.contractAddress];

                          token.cmcId = numbers[index];
                          token.isLocally = true;
                          token.logo = item.tokenList.image;
                          token.ticker = item.tokenList.symbol;
                        });

                        setState((prevState) => ({ ...prevState, tokens }));

                        resolve();
                      });
                    })
                    .catch(() => {
                      reject(errorKey.INVALID_TOKEN);
                    });
                }
              }
            })
            .catch(() => {
              reject(errorKey.INVALID_TOKEN);
            });
        } else {
          reject(errorKey.INVALID_TOKEN);
        }
      } else {
        reject(errorKey.INVALID_TOKEN);
      }
    });
  };

  const getECDSAAddress = (
    chain: Chain,
    vault: VaultProps,
    prefix?: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      initCore()
        .then(({ core, wcRef }) => {
          const coin = wcRef[chain];

          if (coin) {
            api
              .derivePublicKey({
                publicKeyEcdsa: vault.publicKeyEcdsa,
                hexChainCode: vault.hexChainCode,
                derivePath: core.CoinTypeExt.derivationPath(coin),
              })
              .then(({ data }) => {
                const bytes = core.HexCoding.decode(data.publicKey);
                let address: string;

                const publicKey = core.PublicKey.createWithData(
                  bytes,
                  core.PublicKeyType.secp256k1
                );

                if (prefix) {
                  address = core.AnyAddress.createBech32WithPublicKey(
                    publicKey,
                    coin,
                    prefix
                  )?.description();
                } else {
                  address = core.AnyAddress.createWithPublicKey(
                    publicKey,
                    coin
                  )?.description();
                }

                address
                  ? resolve(address)
                  : reject(errorKey.FAIL_TO_GET_ADDRESS);
              })
              .catch((error) => {
                reject(error);
              });
          } else {
            reject(errorKey.INVALID_TOKEN);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getEDDSAAddress = (
    chain: Chain,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      initCore()
        .then(({ core, wcRef }) => {
          const coin = wcRef[chain];

          if (coin) {
            const bytes = core.HexCoding.decode(vault.publicKeyEddsa);

            const eddsaKey = core.PublicKey.createWithData(
              bytes,
              core.PublicKeyType.ed25519
            );

            const address = core.AnyAddress.createWithPublicKey(
              eddsaKey,
              coin
            )?.description();

            address ? resolve(address) : reject(errorKey.FAIL_TO_GET_ADDRESS);
          } else {
            reject(errorKey.INVALID_TOKEN);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getAddress = (coin: TokenProps, vault: VaultProps): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (coin.isNative) {
        switch (coin.chain) {
          // EDDSA
          case Chain.POLKADOT:
          case Chain.SOLANA:
          case Chain.SUI: {
            getEDDSAAddress(coin.chain, vault)
              .then((address) => {
                resolve(address);
              })
              .catch((error) => {
                reject(error);
              });

            break;
          }
          // ECDSA
          case Chain.MAYACHAIN: {
            getECDSAAddress(coin.chain, vault, "maya")
              .then((address) => {
                resolve(address);
              })
              .catch((error) => {
                reject(error);
              });

            break;
          }
          case Chain.BITCOINCASH: {
            getECDSAAddress(coin.chain, vault)
              .then((address) => {
                resolve(address.replace("bitcoincash:", ""));
              })
              .catch((error) => {
                reject(error);
              });

            break;
          }
          default: {
            getECDSAAddress(coin.chain, vault)
              .then((address) => {
                resolve(address);
              })
              .catch((error) => {
                reject(error);
              });

            break;
          }
        }
      } else {
        const address = vault.chains.find(
          ({ name }) => name === coin.chain
        )?.address;

        address ? resolve(address) : reject(errorKey.INVALID_TOKEN);
      }
    });
  };

  const addCoin = (
    coin: TokenProps,
    vault: VaultProps
  ): Promise<CoinProps & CoinParams> => {
    return new Promise((resolve, reject) => {
      const newCoin: CoinParams = {
        address: "",
        chain: coin.chain,
        cmcId: coin.cmcId,
        contractAddress: coin.contractAddress,
        decimals: coin.decimals,
        hexPublicKey:
          coin.hexPublicKey === "ECDSA"
            ? vault.publicKeyEcdsa
            : vault.publicKeyEddsa,
        isNative: coin.isNative,
        logo: coin.logo,
        ticker: coin.ticker,
      };

      getAddress(coin, vault)
        .then((address) => {
          newCoin.address = address;

          api.coin
            .add(vault, newCoin)
            .then(({ data: { coinId } }) => {
              const coin: CoinProps = {
                ...newCoin,
                id: coinId,
                balance: 0,
                value: 0,
              };

              getBalance(coin, newCoin.chain, newCoin.address).then((coin) => {
                getValue([coin], currency).then(([coin]) => {
                  resolve({ ...newCoin, ...coin });
                });
              });
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const toggleCoin = (coin: TokenProps, vault: VaultProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      const selectedChain = vault.chains.find(
        ({ name }) => name === coin.chain
      );

      const selectedCoin = selectedChain?.coins.find(
        ({ ticker }) => coin.ticker === ticker
      );

      if (selectedCoin) {
        api.coin
          .del(vault, selectedCoin)
          .then(() => {
            setState((prevState) => {
              if (prevState.vault?.uid === vault.uid) {
                return {
                  ...prevState,
                  vault: {
                    ...prevState.vault,
                    chains: prevState.vault.chains.map((chain) => ({
                      ...chain,
                      coins: chain.coins.filter(
                        ({ ticker }) =>
                          coin.chain !== chain.name || coin.ticker !== ticker
                      ),
                    })),
                  },
                };
              }

              return prevState;
            });

            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        getCMC(coin).then((cmcId) => {
          addCoin({ ...coin, cmcId }, vault)
            .then((newCoin) => {
              setState((prevState) => ({
                ...prevState,
                vault: {
                  ...vault,
                  chains: selectedChain
                    ? vault.chains.map((chain) => ({
                        ...chain,
                        coins:
                          chain.name === selectedChain.name
                            ? [...chain.coins, newCoin]
                            : chain.coins,
                      }))
                    : [
                        ...vault.chains,
                        {
                          address: newCoin.address,
                          coins: [newCoin],
                          hexPublicKey: newCoin.hexPublicKey,
                          name: newCoin.chain,
                        },
                      ],
                },
              }));

              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    });
  };

  const getCMC = (coin: TokenProps): Promise<number> => {
    return new Promise((resolve) => {
      if (coin.isLocally) {
        resolve(coin.cmcId);
      } else {
        api.coin
          .cmc(coin.contractAddress)
          .then(({ data }) => {
            const [key] = Object.keys(data.data);

            key ? resolve(parseInt(key)) : resolve(0);
          })
          .catch(() => {
            resolve(0);
          });
      }
    });
  };

  const getVault = (vault: VaultProps): Promise<VaultProps> => {
    return new Promise((resolve, reject) => {
      api.vault
        .get(vault)
        .then(({ data }) => {
          if (data.chains.length) {
            const promises = data.chains.flatMap(({ address, coins, name }) =>
              coins.map((coin) => getBalance(coin, name, address))
            );

            Promise.all(promises).then((coins) => {
              getValue(coins, currency).then((coins) => {
                resolve({
                  ...data,
                  chains: data.chains.map((chain) => ({
                    ...chain,
                    coins: chain.coins.map(
                      (coin) => coins.find(({ id }) => id === coin.id) || coin
                    ),
                  })),
                  hexChainCode: vault.hexChainCode,
                });
              });
            });
          } else {
            const promises = tokens
              .filter((coin) => coin.isDefault)
              .map((coin) =>
                addCoin(coin, { ...data, hexChainCode: vault.hexChainCode })
              );

            Promise.all(promises)
              .then(() => {
                getVault(vault).then(resolve).catch(reject);
              })
              .catch((error) => {
                reject(error);
              });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const setVault = (vault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        item.uid === vault.uid ? vault : item
      );

      setVaults(vaults);

      return {
        ...prevState,
        vault: prevState.vault?.uid === vault.uid ? vault : prevState.vault,
        vaults,
      };
    });
  };

  const delVault = (vault: VaultProps): void => {
    const modifiedVaults = vaults.filter(({ uid }) => uid !== vault.uid);

    validation(modifiedVaults)
      .then((vaults) => {
        if (vaults.length) {
          const [vault] = vaults;

          setState((prevState) => ({
            ...prevState,
            vault,
            vaults,
            loaded: true,
          }));

          setVaults(vaults);
        } else {
          navigate(constantPaths.import);
        }
      })
      .catch(() => {
        setVaults(vaults);

        navigate(constantPaths.import);
      });
  };

  const useVault = (vault: VaultProps): void => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: true }));

      getVault(vault)
        .then((vault) => {
          setState((prevState) => ({ ...prevState, loading: false, vault }));
        })
        .catch(() => {
          setState((prevState) => ({ ...prevState, loading: false }));
        });
    }
  };

  const validation = (vaults: VaultProps[]): Promise<VaultProps[]> => {
    return new Promise((resolve, reject) => {
      const [vault, ...remainingVaults] = vaults;

      if (vault) {
        getVault(vault)
          .then((vault) => {
            resolve([vault, ...remainingVaults]);
          })
          .catch(() => {
            validation(remainingVaults).then(resolve).catch(reject);
          });
      } else {
        reject();
      }
    });
  };

  const componentDidMount = (): void => {
    validation(getVaults())
      .then((vaults) => {
        if (vaults.length) {
          const [vault] = vaults;

          setState((prevState) => ({
            ...prevState,
            vault,
            vaults,
            loaded: true,
          }));

          setVaults(vaults);
        } else {
          navigate(constantPaths.import);
        }
      })
      .catch(() => {
        setVaults(vaults);

        navigate(constantPaths.import);
      });
  };

  useEffect(componentDidMount, []);

  return (
    <VaultContext.Provider
      value={{
        fetchTokens,
        delVault,
        setVault,
        useVault,
        toggleCoin,
        tokens,
        vault,
        vaults,
      }}
    >
      {loaded ? (
        <>
          <div className="layout">
            <Header uid={vault?.uid} />
            {children}
          </div>
          <ChangeCurrency onChange={changeCurrency} />
          <ChangeLanguage />
          <DeleteVault delVault={delVault} vault={vault} />
          <RenameVault setVault={setVault} vault={vault} />
          <VaultSettings vault={vault} />
          <Preloader visible={loading} />
        </>
      ) : (
        <SplashScreen />
      )}
    </VaultContext.Provider>
  );
};

export default Component;

export const useVaultContext = (): VaultContext => {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVaultContext must be used within a VaultProvider");
  }

  return context;
};