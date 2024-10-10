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

              address ? resolve(address) : reject(errorKey.FAIL_TO_GET_ADDRESS);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch(reject);
    });
  };

  private getEDDSAAddress = (
    chain: ChainKey,
    vault: VaultProps
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
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

          address ? resolve(address) : reject(errorKey.FAIL_TO_GET_ADDRESS);
        })
        .catch(reject);
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
                    newCoin.balance = balance;

                    this.getValues([newCoin], currency).then(([{ value }]) => {
                      newCoin.value = value;

                      resolve(newCoin);
                    });
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
          case ChainKey.MAYACHAIN: {
            this.getECDSAAddress(chain, vault, "maya")
              .then(resolve)
              .catch(reject);

            break;
          }
          case ChainKey.BITCOINCASH: {
            this.getECDSAAddress(chain, vault)
              .then((address) => {
                resolve(address.replace("bitcoincash:", ""));
              })
              .catch(reject);

            break;
          }
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
            .cosmos(path, address, coin.decimals, "cacao")
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

  public getTokens = (chain: ChainProps): Promise<TokenProps[]> => {
    return new Promise((resolve, reject) => {
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
          reject(errorKey.INVALID_TOKEN);
        }
      } else {
        reject(errorKey.INVALID_TOKEN);
      }
    });
  };

  public getValues = (
    coins: CoinProps[],
    currency: Currency
  ): Promise<CoinProps[]> => {
    return new Promise((resolve) => {
      const cmcIds = coins
        .filter(({ cmcId }) => cmcId > 0)
        .map(({ cmcId }) => cmcId);

      if (cmcIds.length) {
        api.coin
          .values(cmcIds, currency)
          .then(({ data }) => {
            const cacao = coins.find(({ ticker }) => ticker === "CACAO");
            const modifedCoins = coins.map((coin) => ({
              ...coin,
              value:
                data?.data && data?.data[coin.cmcId]?.quote
                  ? data.data[coin.cmcId].quote[currency]?.price || 0
                  : 0,
            }));

            if (cacao) {
              api.coin
                .coingeckoValue(cacao.ticker, currency)
                .then(({ data }) => {
                  resolve(
                    modifedCoins.map((coin) => ({
                      ...coin,
                      value:
                        coin.ticker === cacao.ticker
                          ? data.cacao[currency.toLowerCase()] || 0
                          : coin.value,
                    }))
                  );
                })
                .catch(() => {
                  resolve(coins.map((coin) => ({ ...coin, value: 0 })));
                });
            } else {
              resolve(modifedCoins);
            }
          })
          .catch(() => {
            resolve(coins.map((coin) => ({ ...coin, value: 0 })));
          });
      } else {
        resolve(coins.map((coin) => ({ ...coin, value: 0 })));
      }
    });
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
                    token.chain === chain.name
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
