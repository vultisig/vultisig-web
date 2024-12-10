import { initWasm, type WalletCore } from "@trustwallet/wallet-core";
import { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import {
  ChainKey,
  Currency,
  TickerKey,
  balanceAPI,
  balanceDenom,
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
              [ChainKey.TERRA]: walletCore.CoinType.terra,
              [ChainKey.TERRACLASSIC]: walletCore.CoinType.terra,
              [ChainKey.THORCHAIN]: walletCore.CoinType.thorchain,
              [ChainKey.TON]: walletCore.CoinType.ton,
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
                    case ChainKey.MAYACHAIN:
                    case ChainKey.THORCHAIN: {
                      const mayaAddress =
                        walletCore.AnyAddress.createBech32WithPublicKey(
                          publicKey,
                          coin,
                          TickerKey.MAYA.toLowerCase()
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
                    case ChainKey.TERRA:
                    case ChainKey.TERRACLASSIC: {
                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.TERRA,
                        address
                      );

                      setStoredAddress(
                        vault.publicKeyEcdsa,
                        ChainKey.TERRACLASSIC,
                        address
                      );

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

  public addToken = (
    token: TokenProps,
    vault: VaultProps
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

                resolve(newCoin);
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch(reject);
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
          case ChainKey.SUI:
          case ChainKey.TON: {
            this.getEDDSAAddress(chain, vault).then(resolve).catch(reject);

            break;
          }
          // ECDSA
          case ChainKey.MAYACHAIN: {
            this.getECDSAAddress(chain, vault, TickerKey.MAYA.toLowerCase())
              .then(resolve)
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
    address: string,
    chain: ChainKey,
    contractAddress: string,
    decimals: number,
    isNative: boolean,
    ticker: string
  ): Promise<number> => {
    return new Promise((resolve) => {
      const denom = balanceDenom[chain];
      const path = balanceAPI[chain];

      switch (chain) {
        // Cosmos
        case ChainKey.DYDX:
        case ChainKey.GAIACHAIN:
        case ChainKey.KUJIRA:
        case ChainKey.TERRA:
        case ChainKey.TERRACLASSIC:
        case ChainKey.THORCHAIN: {
          api.balance.cosmos(path, address, decimals, denom).then(resolve);

          break;
        }
        case ChainKey.MAYACHAIN: {
          api.balance
            .cosmos(path, address, decimals, ticker.toLowerCase())
            .then(resolve);

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
        case ChainKey.POLYGON:
        case ChainKey.ZKSYNC: {
          api.balance
            .evm(path, address, decimals, contractAddress, isNative)
            .then(resolve);

          break;
        }
        // UTXO
        case ChainKey.BITCOIN:
        case ChainKey.BITCOINCASH:
        case ChainKey.DASH:
        case ChainKey.DOGECOIN:
        case ChainKey.LITECOIN: {
          api.balance.utxo(path, address, decimals).then(resolve);

          break;
        }
        // CUSTOM
        case ChainKey.POLKADOT: {
          api.balance.polkadot(path, address).then(resolve);

          break;
        }
        case ChainKey.SOLANA: {
          api.balance
            .solana(path, address, decimals, contractAddress, isNative)
            .then(resolve);

          break;
        }
        case ChainKey.SUI: {
          api.balance.sui(path, address, decimals).then(resolve);

          break;
        }
        case ChainKey.TON: {
          api.balance.ton(path, address, decimals).then(resolve);

          break;
        }
        default:
          resolve(0);

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
                  const modifiedTokens = tokens.filter(
                    ({ contractAddress }) => !!data[contractAddress]
                  );
                  const promises = modifiedTokens.map((token) =>
                    this.getCMC(token)
                  );

                  Promise.all(promises).then((numbers) => {
                    resolve(
                      modifiedTokens.map((token, index) => {
                        const item = data[token.contractAddress];

                        return {
                          ...token,
                          cmcId: numbers[index],
                          isLocally: true,
                          logo: item.tokenList.image,
                          ticker: item.tokenList.symbol,
                        };
                      })
                    );
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
      const promises = coins.map((coin) => {
        if (coin.balance) {
          switch (coin.ticker) {
            case TickerKey.CACAO:
              return api.coin
                .coingeckoValue(coin.ticker, currency)
                .then((value) => {
                  coin.value = value;
                });
            case TickerKey.MAYA:
              const usdt = defTokens.find(
                ({ chain, ticker }) =>
                  chain === ChainKey.ETHEREUM && ticker === TickerKey.USDT
              );

              return api.coin.value(usdt!.cmcId, currency).then((value) => {
                coin.value = value * 40;
              });
            case TickerKey.VTHOR:
              const thor = defTokens.find(
                ({ chain, ticker }) =>
                  chain === ChainKey.ETHEREUM && ticker === TickerKey.THOR
              );

              return Promise.all([
                api.coin.value(thor!.cmcId, currency),
                api.coin.value(thor!.cmcId, Currency.USD),
                api.coin.lifiValue(coin.contractAddress),
              ]).then(([thorPriceCurrency, thorPriceUSD, vTHORUPriceUSD]) => {
                coin.value =
                  (vTHORUPriceUSD * thorPriceCurrency) / thorPriceUSD;
              });
            default:
              coin.value = 0;

              return false;
          }
        } else {
          coin.value = 0;

          return false;
        }
      });

      Promise.all(promises).then(() => {
        const cmcIds = coins
          .filter(({ balance, cmcId }) => balance > 0 && cmcId > 0)
          .map(({ cmcId }) => cmcId);

        if (cmcIds.length) {
          api.coin.values(cmcIds, currency).then((values) => {
            resolve(
              coins.map((coin) => ({
                ...coin,
                value: values[coin.cmcId] ?? coin.value,
              }))
            );
          });
        } else {
          resolve(coins);
        }
      });
    });
  };

  public prepareChain = (
    chain: ChainProps,
    currency: Currency
  ): Promise<ChainProps> => {
    return new Promise((resolve) => {
      const promises = chain.coins.map((coin) =>
        this.getBalance(
          chain.address,
          chain.name,
          coin.contractAddress,
          coin.decimals,
          coin.isNative,
          coin.ticker
        ).then((balance) => {
          coin.balance = balance;
        })
      );

      Promise.all(promises).then(() => {
        this.getValues(chain.coins, currency).then((coins) => {
          resolve({ ...chain, coins });
        });
      });
    });
  };

  public sortChain = (chain: ChainProps): ChainProps => {
    return {
      ...chain,
      balance: chain.coins.reduce(
        (acc, coin) => acc + coin.balance * coin.value,
        0
      ),
      coins: chain.coins
        .slice()
        .sort((a, b) => b.balance * b.value - a.balance * a.value),
      coinsUpdated: true,
    };
  };
}
