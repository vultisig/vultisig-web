import { initWasm, type WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import {
  ChainKey,
  Currency,
  balanceAPI,
  defTokens,
  errorKey,
  oneInchRef,
} from "utils/constants";
import type {
  ChainProps,
  CoinParams,
  CoinProps,
  TokenProps,
  VaultProps,
} from "utils/interfaces";
import { getStoredAddress, setStoredAddress } from "utils/storage";
import api from "utils/api";

interface ChainRef {
  [chainKey: string]: CoinType;
}

export default class VaultProvider {
  private chainRef?: ChainRef;
  private walletCore?: WalletCore;

  constructor() {}

  private getWalletCore = (): Promise<{
    chainRef: ChainRef;
    walletCore: WalletCore;
  }> => {
    return new Promise((resolve, reject) => {
      if (this.walletCore && this.chainRef) {
        resolve({ chainRef: this.chainRef, walletCore: this.walletCore });
      } else {
        initWasm()
          .then((walletCore) => {
            this.walletCore = walletCore;

            this.chainRef = {
              [ChainKey.ARBITRUM]: walletCore.CoinType.arbitrum,
              [ChainKey.AVALANCHE]: walletCore.CoinType.avalancheCChain,
              [ChainKey.BASE]: walletCore.CoinType.base,
              [ChainKey.BITCOIN]: walletCore.CoinType.bitcoin,
              [ChainKey.BITCOINCASH]: walletCore.CoinType.bitcoinCash,
              [ChainKey.BLAST]: walletCore.CoinType.blast,
              [ChainKey.BSCCHAIN]: walletCore.CoinType.smartChain,
              [ChainKey.CRONOSCHAIN]: walletCore.CoinType.cronosChain,
              [ChainKey.DASH]: walletCore.CoinType.dash,
              [ChainKey.DOGECOIN]: walletCore.CoinType.dogecoin,
              [ChainKey.DYDX]: walletCore.CoinType.dydx,
              [ChainKey.ETHEREUM]: walletCore.CoinType.ethereum,
              [ChainKey.GAIACHAIN]: walletCore.CoinType.cosmos,
              [ChainKey.KUJIRA]: walletCore.CoinType.kujira,
              [ChainKey.LITECOIN]: walletCore.CoinType.litecoin,
              [ChainKey.MAYACHAIN]: walletCore.CoinType.thorchain,
              [ChainKey.OPTIMISM]: walletCore.CoinType.optimism,
              [ChainKey.POLKADOT]: walletCore.CoinType.polkadot,
              [ChainKey.POLYGON]: walletCore.CoinType.polygon,
              [ChainKey.SOLANA]: walletCore.CoinType.solana,
              [ChainKey.SUI]: walletCore.CoinType.sui,
              [ChainKey.THORCHAIN]: walletCore.CoinType.thorchain,
              [ChainKey.ZKSYNC]: walletCore.CoinType.zksync,
            };

            resolve({ chainRef: this.chainRef, walletCore: this.walletCore });
          })
          .catch(() => {
            reject(errorKey.FAIL_TO_INIT_WASM);
          });
      }
    });
  };

  private getECDSAAddress = (
    chain: ChainKey,
    vault: VaultProps,
    prefix?: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const derivationKey = getStoredAddress(vault.publicKeyEcdsa, chain);

      if (derivationKey) {
        resolve(derivationKey);
      } else {
        this.getWalletCore()
          .then(({ chainRef, walletCore }) => {
            const coin = chainRef[chain];

            api
              .derivePublicKey({
                publicKeyEcdsa: vault.publicKeyEcdsa,
                hexChainCode: vault.hexChainCode,
                derivePath: walletCore.CoinTypeExt.derivationPath(coin),
              })
              .then(({ data: { publicKey: derivationKey } }) => {
                const bytes = walletCore.HexCoding.decode(derivationKey);
                let address: string;

                const publicKey = walletCore.PublicKey.createWithData(
                  bytes,
                  walletCore.PublicKeyType.secp256k1
                );

                if (prefix) {
                  address = walletCore.AnyAddress.createBech32WithPublicKey(
                    publicKey,
                    coin,
                    prefix
                  )?.description();
                } else {
                  address = walletCore.AnyAddress.createWithPublicKey(
                    publicKey,
                    coin
                  )?.description();
                }

                if (address) {
                  switch (chain) {
                    case ChainKey.ARBITRUM:
                    case ChainKey.AVALANCHE:
                    case ChainKey.BASE:
                    case ChainKey.BLAST:
                    case ChainKey.BSCCHAIN:
                    case ChainKey.CRONOSCHAIN:
                    case ChainKey.ETHEREUM:
                    case ChainKey.OPTIMISM:
                    case ChainKey.POLYGON:
                    case ChainKey.ZKSYNC: {
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.ARBITRUM,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.AVALANCHE,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.BASE,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.BLAST,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.BSCCHAIN,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.CRONOSCHAIN,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.ETHEREUM,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.OPTIMISM,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.POLYGON,
                        address
                      );
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.ZKSYNC,
                        address
                      );

                      break;
                    }
                    case ChainKey.DYDX:
                    case ChainKey.GAIACHAIN:
                    case ChainKey.KUJIRA: {
                      const dydxAddress =
                        walletCore.AnyAddress.createWithPublicKey(
                          publicKey,
                          chainRef[ChainKey.DYDX]
                        )?.description();

                      const gaiaAddress =
                        walletCore.AnyAddress.createWithPublicKey(
                          publicKey,
                          chainRef[ChainKey.GAIACHAIN]
                        )?.description();

                      const kujiraAddress =
                        walletCore.AnyAddress.createWithPublicKey(
                          publicKey,
                          chainRef[ChainKey.KUJIRA]
                        )?.description();

                      if (dydxAddress) {
                        setStoredAddress(
                          vault.publicKeyEcdsa,
                          ChainKey.DYDX,
                          dydxAddress
                        );
                      }

                      if (gaiaAddress) {
                        setStoredAddress(
                          vault.publicKeyEcdsa,
                          ChainKey.GAIACHAIN,
                          gaiaAddress
                        );
                      }

                      if (kujiraAddress) {
                        setStoredAddress(
                          vault.publicKeyEcdsa,
                          ChainKey.KUJIRA,
                          kujiraAddress
                        );
                      }

                      break;
                    }
                    case ChainKey.MAYACHAIN: {
                      const mayaAddress =
                        walletCore.AnyAddress.createBech32WithPublicKey(
                          publicKey,
                          coin,
                          "maya"
                        )?.description();

                      const thorAddress =
                        walletCore.AnyAddress.createWithPublicKey(
                          publicKey,
                          chainRef[ChainKey.THORCHAIN]
                        )?.description();

                      if (mayaAddress) {
                        setStoredAddress(
                          vault.publicKeyEcdsa,
                          ChainKey.MAYACHAIN,
                          mayaAddress
                        );
                      }

                      if (thorAddress) {
                        setStoredAddress(
                          vault.publicKeyEcdsa,
                          ChainKey.THORCHAIN,
                          thorAddress
                        );
                      }

                      break;
                    }
                    case ChainKey.BITCOINCASH: {
                      address = address.replace("bitcoincash:", "");

                      setStoredAddress(vault.publicKeyEcdsa, chain, address);

                      break;
                    }
                    default: {
                      setStoredAddress(vault.publicKeyEcdsa, chain, address);
                      break;
                    }
                  }

                  resolve(address);
                } else {
                  reject(errorKey.FAIL_TO_GET_ADDRESS);
                }
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch(reject);
      }
    });
  };

  private getEDDSAAddress = (
    chain: ChainKey,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const derivationKey = getStoredAddress(vault.publicKeyEddsa, chain);

      if (derivationKey) {
        resolve(derivationKey);
      } else {
        this.getWalletCore()
          .then(({ chainRef, walletCore }) => {
            const coin = chainRef[chain];

            const bytes = walletCore.HexCoding.decode(vault.publicKeyEddsa);

            const publicKey = walletCore.PublicKey.createWithData(
              bytes,
              walletCore.PublicKeyType.ed25519
            );

            const address = walletCore.AnyAddress.createWithPublicKey(
              publicKey,
              coin
            )?.description();

            if (address) {
              setStoredAddress(vault.publicKeyEddsa, chain, address);

              resolve(address);
            } else {
              reject(errorKey.FAIL_TO_GET_ADDRESS);
            }
          })
          .catch(reject);
      }
    });
  };

  private getCacaoValue = (
    coins: CoinProps[],
    currency: Currency
  ): Promise<number> => {
    return new Promise((resolve) => {
      const cacao = coins.find(({ ticker }) => ticker === "CACAO");

      if (cacao && cacao.balance) {
        api.coin
          .coingeckoValue(cacao.ticker, currency)
          .then(({ data }) => {
            resolve(data?.cacao ? data.cacao[currency.toLowerCase()] || 0 : 0);
          })
          .catch(() => {
            resolve(0);
          });
      } else {
        resolve(0);
      }
    });
  };

  private getMayaValue = (
    coins: CoinProps[],
    currency: Currency
  ): Promise<number> => {
    return new Promise((resolve) => {
      const maya = coins.find(({ ticker }) => ticker === "MAYA");

      if (maya && maya.balance) {
        const usdt = defTokens.find(({ ticker }) => ticker === "USDT");

        api.coin
          .value(usdt!.cmcId, currency)
          .then((price) => {
            resolve(price * 40);
          })
          .catch(() => {
            resolve(0);
          });
      } else {
        resolve(0);
      }
    });
  };

  private getVThorValue = (
    coins: CoinProps[],
    currency: Currency
  ): Promise<number> => {
    return new Promise((resolve) => {
      const vThor = coins.find(({ ticker }) => ticker === "vTHOR");

      if (vThor && vThor.balance) {
        const thor = defTokens.find(({ ticker }) => ticker === "THOR");

        api.coin
          .value(thor!.cmcId, currency)
          .then((thorPriceCurrency) => {
            api.coin
              .value(thor!.cmcId, Currency.USD)
              .then((thorPriceUSD) => {
                api.coin
                  .lifiValue(vThor.contractAddress)
                  .then((vTHORUPriceUSD) => {
                    resolve(
                      (vTHORUPriceUSD * thorPriceCurrency) / thorPriceUSD
                    );
                  })
                  .catch(() => {
                    resolve(0);
                  });
              })
              .catch(() => {
                resolve(0);
              });
          })
          .catch(() => {
            resolve(0);
          });
      } else {
        resolve(0);
      }
    });
  };

  public addToken = (
    token: TokenProps,
    vault: VaultProps,
    currency: Currency
  ): Promise<CoinParams & CoinProps> => {
    return new Promise((resolve, reject) => {
      this.getCMC(token).then((cmcId) => {
        this.getAddress(token, vault)
          .then((address) => {
            const baseCoin: CoinParams = {
              address,
              chain: token.chain,
              cmcId,
              contractAddress: token.contractAddress,
              decimals: token.decimals,
              hexPublicKey:
                token.hexPublicKey === "ECDSA"
                  ? vault.publicKeyEcdsa
                  : vault.publicKeyEddsa,
              isNative: token.isNative,
              logo: token.logo,
              ticker: token.ticker,
            };

            api.coin
              .add(vault, baseCoin)
              .then(({ data: { coinId } }) => {
                const newCoin: CoinParams & CoinProps = {
                  ...baseCoin,
                  balance: 0,
                  id: coinId,
                  value: 0,
                };

                this.getBalance(newCoin, newCoin.chain, newCoin.address).then(
                  ({ balance }) => {
                    if (balance) {
                      newCoin.balance = balance;

                      this.getValues([newCoin], currency).then(
                        ([{ value }]) => {
                          newCoin.value = value;

                          resolve(newCoin);
                        }
                      );
                    } else {
                      resolve(newCoin);
                    }
                  }
                );
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  };

  public compareVault = (first: VaultProps, second: VaultProps): boolean => {
    return (
      first.publicKeyEcdsa === second.publicKeyEcdsa &&
      first.publicKeyEddsa === second.publicKeyEddsa
    );
  };

  public getAddress = (
    token: TokenProps,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const { chain, isNative } = token;

      if (isNative) {
        switch (chain) {
          // EDDSA
          case ChainKey.POLKADOT:
          case ChainKey.SOLANA:
          case ChainKey.SUI: {
            this.getEDDSAAddress(chain, vault).then(resolve).catch(reject);

            break;
          }
          // ECDSA
          default: {
            this.getECDSAAddress(chain, vault).then(resolve).catch(reject);

            break;
          }
        }
      } else {
        const address = vault.chains.find(
          ({ name }) => name === chain
        )?.address;

        address ? resolve(address) : reject(errorKey.INVALID_TOKEN);
      }
    });
  };

  public getBalance = (
    coin: CoinProps,
    chain: ChainKey,
    address: string
  ): Promise<CoinProps> => {
    return new Promise((resolve) => {
      const path = balanceAPI[chain];

      switch (chain) {
        // Cosmos
        case ChainKey.DYDX: {
          api.balance
            .cosmos(path, address, coin.decimals, "adydx")
            .then((balance) => {
              resolve({ ...coin, balance });
            });

          break;
        }
        case ChainKey.GAIACHAIN: {
          api.balance
            .cosmos(path, address, coin.decimals, "uatom")
            .then((balance) => {
              resolve({ ...coin, balance });
            });
          break;
        }
        case ChainKey.KUJIRA: {
          api.balance
            .cosmos(path, address, coin.decimals, "ukuji")
            .then((balance) => {
              resolve({ ...coin, balance });
            });
          break;
        }
        case ChainKey.MAYACHAIN: {
          api.balance
            .cosmos(path, address, coin.decimals, coin.ticker.toLowerCase())
            .then((balance) => {
              resolve({ ...coin, balance });
            });
          break;
        }
        case ChainKey.THORCHAIN: {
          api.balance
            .cosmos(path, address, coin.decimals, "rune")
            .then((balance) => {
              resolve({ ...coin, balance });
            });
          break;
        }
        // EVM
        case ChainKey.ARBITRUM:
        case ChainKey.AVALANCHE:
        case ChainKey.BASE:
        case ChainKey.BLAST:
        case ChainKey.BSCCHAIN:
        case ChainKey.CRONOSCHAIN:
        case ChainKey.ETHEREUM:
        case ChainKey.OPTIMISM:
        case ChainKey.POLYGON: {
          api.balance
            .evm(
              path,
              address,
              coin.decimals,
              coin.contractAddress,
              coin.isNative
            )
            .then((balance) => {
              resolve({ ...coin, balance });
            });

          break;
        }
        case ChainKey.POLKADOT: {
          api.balance
            .polkadot(path, address)
            .then((balance) => {
              resolve({ ...coin, balance });
            })
            .catch(() => {
              resolve({ ...coin, balance: 0 });
            });

          break;
        }
        case ChainKey.SOLANA: {
          api.balance
            .solana(
              path,
              address,
              coin.decimals,
              coin.contractAddress,
              coin.isNative
            )
            .then((balance) => {
              resolve({ ...coin, balance });
            });

          break;
        }
        // UTXO
        case ChainKey.BITCOIN:
        case ChainKey.BITCOINCASH:
        case ChainKey.DASH:
        case ChainKey.DOGECOIN:
        case ChainKey.LITECOIN: {
          api.balance.utxo(path, address, coin.decimals).then((balance) => {
            resolve({ ...coin, balance });
          });

          break;
        }
        default:
          resolve({ ...coin, balance: 0 });
          break;
      }
    });
  };

  public getCMC = (coin: TokenProps): Promise<number> => {
    return new Promise((resolve) => {
      if (coin.isLocally) {
        resolve(coin.cmcId);
      } else {
        api.coin.cmc(coin.contractAddress).then(resolve);
      }
    });
  };

  public getTokens = (chain: ChainProps): Promise<TokenProps[]> => {
    return new Promise((resolve) => {
      const token = defTokens.find((item) => item.chain === chain.name);
      const id = oneInchRef[chain.name];

      if (token) {
        if (id) {
          api
            .oneInch(id)
            .then(({ data }) => {
              const tokens: TokenProps[] = [];

              Object.entries(data.tokens).forEach(([key, value]) => {
                const notFound =
                  defTokens.findIndex(
                    (token) =>
                      token.contractAddress.toLowerCase() === key.toLowerCase()
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

              resolve([...defTokens, ...tokens]);
            })
            .catch(() => {
              resolve(defTokens);
            });
        } else if (token.chain === ChainKey.SOLANA) {
          api.discovery.spl(chain.address).then((tokens) => {
            if (tokens.length) {
              api.discovery.info
                .spl(tokens.map(({ contractAddress }) => contractAddress))
                .then(({ data }) => {
                  const promises = tokens.map((token) => this.getCMC(token));

                  Promise.all(promises).then((numbers) => {
                    tokens.forEach((token, index) => {
                      const item = data[token.contractAddress];

                      token.cmcId = numbers[index];
                      token.isLocally = true;
                      token.logo = item.tokenList.image;
                      token.ticker = item.tokenList.symbol;
                    });

                    resolve(tokens);
                  });
                })
                .catch(() => {
                  resolve([]);
                });
            } else {
              resolve([]);
            }
          });
        } else {
          resolve(defTokens.filter(({ isNative }) => !isNative));
        }
      } else {
        resolve([]);
      }
    });
  };

  public getValues = (
    coins: CoinProps[],
    currency: Currency
  ): Promise<CoinProps[]> => {
    return new Promise((resolve) => {
      const promises = [
        this.getCacaoValue(coins, currency),
        this.getMayaValue(coins, currency),
        this.getVThorValue(coins, currency),
      ];

      Promise.all(promises).then(([cacao, maya, vThor]) => {
        const modifedCoins = coins.map((coin) => {
          let value: number;

          switch (coin.ticker) {
            case "CACAO":
              value = cacao;
              break;
            case "MAYA":
              value = maya;
              break;
            case "vTHOR":
              value = vThor;
              break;
            default:
              value = 0;
              break;
          }

          return { ...coin, value };
        });

        const cmcIds = coins
          .filter(({ balance, cmcId }) => balance > 0 && cmcId > 0)
          .map(({ cmcId }) => cmcId);

        if (cmcIds.length) {
          api.coin
            .values(cmcIds, currency)
            .then((values) => {
              resolve(
                modifedCoins.map((coin) => ({
                  ...coin,
                  value: values[coin.cmcId] ?? coin.value,
                }))
              );
            })
            .catch(() => {
              resolve(modifedCoins);
            });
        } else {
          resolve(modifedCoins);
        }
      });
    });
  };

  public prepareVault = (vault: VaultProps): VaultProps => {
    if (vault.updated) {
      vault.chains = vault.chains.map((chain) => ({
        ...chain,
        balance: chain.coins.reduce(
          (acc, coin) => acc + coin.balance * coin.value,
          0
        ),
        coins: chain.coins
          .slice()
          .sort((a, b) => b.balance * b.value - a.balance * a.value),
      }));

      vault.chains = vault.chains.slice().sort((a, b) => b.balance - a.balance);

      vault.currentBalance = vault.chains.reduce(
        (acc, chain) => acc + chain.balance,
        0
      );
    }

    return vault;
  };

  public toggleToken = (
    token: TokenProps,
    vault: VaultProps,
    currency: Currency
  ): Promise<VaultProps> => {
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
            resolve({
              ...vault,
              chains: vault.chains
                .map((chain) => ({
                  ...chain,
                  coins:
                    token.isNative && token.chain === chain.name
                      ? []
                      : chain.coins.filter(
                          ({ ticker }) =>
                            token.chain !== chain.name ||
                            token.ticker !== ticker
                        ),
                }))
                .filter(({ coins }) => !!coins.length),
            });
          })
          .catch(reject);
      } else {
        this.addToken(token, vault, currency)
          .then((newToken) => {
            resolve({
              ...vault,
              chains: selectedChain
                ? vault.chains.map((chain) => ({
                    ...chain,
                    coins:
                      chain.name === selectedChain.name
                        ? [...chain.coins, newToken]
                        : chain.coins,
                  }))
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
            });
          })
          .catch(reject);
      }
    });
  };
}
