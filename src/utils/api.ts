import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { toCamelCase, toSnakeCase } from "utils/functions";
import {
  ChainKey,
  CollectionKey,
  Currency,
  defTokens,
  errorKey,
  nftCollection,
} from "utils/constants";
import {
  CoinParams,
  CoinProps,
  NFTProps,
  NodeInfo,
  SharedSettings,
  TokenProps,
  VaultProps,
} from "utils/interfaces";

const fetch = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_ADDRESS}`,
  headers: { accept: "application/json" },
});

fetch.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error.response);
  }
);

fetch.interceptors.response.use(
  (response) => {
    response.data = toCamelCase(response.data);

    return response;
  },
  ({ response }) => {
    return Promise.reject(response.data.error);
  }
);

namespace CMC {
  export interface Result {
    data: {
      [id: string]: { quote: { [currency: string]: { price: number } } };
    };
  }

  export interface Props {
    [id: string]: number;
  }
}

namespace Derivation {
  export interface Params {
    publicKeyEcdsa: string;
    hexChainCode: string;
    derivePath: string;
  }

  export interface Props {
    publicKey: string;
  }
}

namespace Leaderboard {
  export interface Params {
    from: number;
    limit: number;
  }

  export interface Props {
    vaults: VaultProps[];
    totalVaultCount: number;
    totalBalance: number;
    totalLp: number;
  }
}

namespace OneInch {
  export interface Props {
    tokens: {
      [address: string]: {
        decimals: number;
        logoURI: string;
        name: string;
        symbol: string;
      };
    };
  }
}

interface ActivePositions {
  maya: {
    assetAddress: string;
    runeAddress: string;
    runeAdded: number;
    runeOrCacaoPricePriceUsd: number;
    assetAdded: number;
    assetPriceUsd: number;
    pool: string;
  }[];
  thorchain: {
    assetAddress: string;
    runeAddress: string;
    runeAdded: number;
    runeOrCacaoPricePriceUsd: number;
    assetAdded: number;
    assetPriceUsd: number;
    pool: string;
  }[];
}

interface SaverPositions {
  pools: {
    assetRedeem: number;
    assetAddress: string;
    pool: string;
  }[];
}

const api = {
  airdrop: {
    join: async (params: VaultProps) => {
      return await fetch.post("vault/join-airdrop", toSnakeCase(params));
    },
    exit: async (params: VaultProps) => {
      return await fetch.post("vault/exit-airdrop", toSnakeCase(params));
    },
  },
  activePositions: {
    nodeInfo: async () => {
      return await fetch.get<NodeInfo[]>(
        `https://thornode.ninerealms.com/thorchain/nodes`
      );
    },
    getLiquidityPositions: async (addresses: string) => {
      return await fetch.get<ActivePositions>(
        `https://api-v2-prod.thorwallet.org/pools/positions?addresses=${addresses}`
      );
    },
    getSaverPositions: async (addresses: string) => {
      return await fetch.get<SaverPositions>(
        `https://api-v2-prod.thorwallet.org/saver/positions?addresses=${addresses}`
      );
    },
    getTGTstake: async (address: string) => {
      return await fetch.get<{ stakedAmount: number; reward: number }>(
        `https://api-v2-prod.thorwallet.org/stake/${address}`
      );
    },
    getRuneProvider: async (address: string) => {
      return await fetch.get<{ value: number }>(
        `https://thornode.ninerealms.com/thorchain/rune_provider/${address}`
      );
    },
  },
  balance: {
    cosmos: (
      path: string,
      address: string,
      decimals: number,
      denom: string
    ): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{
            balances: { denom: string; amount: string }[];
          }>(`${path}/${address}`)
          .then(({ data }) => {
            if (data?.balances && Array.isArray(data.balances)) {
              const amount = data.balances.find(
                (balance) => balance.denom === denom
              )?.amount;

              amount
                ? resolve(parseInt(amount) / Math.pow(10, decimals))
                : resolve(0);
            } else {
              resolve(0);
            }
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    evm: (
      path: string,
      address: string,
      decimals: number,
      contract: string,
      isNative: boolean
    ): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .post<{ id: number; jsonrpc: string; result: string }>(path, {
            id: uuidv4(),
            jsonrpc: "2.0",
            method: isNative ? "eth_getBalance" : "eth_call",
            params: [
              isNative
                ? address
                : {
                    data: `0x70a08231000000000000000000000000${address.replace(
                      "0x",
                      ""
                    )}`,
                    to: contract,
                  },
              "latest",
            ],
          })
          .then(({ data }) => {
            resolve(
              data?.result
                ? parseInt(data.result, 16) / Math.pow(10, decimals)
                : 0
            );
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    polkadot: (path: string, address: string): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .post<{
            data: { account: { balance: string } };
          }>(path, { key: address })
          .then(({ data }) => {
            resolve(parseFloat(data?.data?.account?.balance ?? "0"));
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    solana: (
      path: string,
      address: string,
      decimals: number,
      contract: string,
      isNative: boolean
    ): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .post<{
            result: {
              value:
                | number
                | {
                    account: {
                      data: {
                        parsed: { info: { tokenAmount: { amount: number } } };
                      };
                    };
                  }[];
            };
          }>(path, {
            jsonrpc: "2.0",
            method: isNative ? "getBalance" : "getTokenAccountsByOwner",
            params: isNative
              ? [address]
              : [address, { mint: contract }, { encoding: "jsonParsed" }],
            id: uuidv4(),
          })
          .then(({ data }) => {
            let balance = 0;

            if (Array.isArray(data.result.value)) {
              const [value] = data.result.value;

              balance =
                value?.account?.data?.parsed?.info?.tokenAmount?.amount ?? 0;
            } else {
              balance = data.result.value;
            }

            if (balance) balance = balance / Math.pow(10, decimals);

            resolve(balance);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    sui: (path: string, address: string, decimals: number): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .post<{
            id: number;
            jsonrpc: string;
            result: [{ coinType: string; totalBalance: string }];
          }>(path, {
            id: uuidv4(),
            jsonrpc: "2.0",
            method: "suix_getAllBalances",
            params: [address],
          })
          .then(({ data }) => {
            if (data?.result && Array.isArray(data.result)) {
              const amount = data.result.find(
                ({ coinType }) => coinType === "0x2::sui::SUI"
              )?.totalBalance;

              amount
                ? resolve(parseInt(amount) / Math.pow(10, decimals))
                : resolve(0);
            } else {
              resolve(0);
            }
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    ton: (path: string, address: string, decimals: number): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{ balance: string }>(path, {
            params: { address, use_v2: false },
          })
          .then(({ data }) => {
            const balance = parseFloat(data?.balance ?? "0");

            resolve(balance >= 0 ? balance / Math.pow(10, decimals) : 0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    utxo: (
      path: string,
      address: string,
      decimals: number
    ): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{
            data: { [address: string]: { address: { balance: number } } };
          }>(`${path}/${address}?state=latest`)
          .then(({ data }) => {
            if (
              data?.data &&
              data.data[address] &&
              data.data[address].address?.balance
            ) {
              resolve(
                data.data[address].address.balance / Math.pow(10, decimals)
              );
            } else {
              resolve(0);
            }
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
  },
  coin: {
    add: async (vault: VaultProps, coin: CoinParams) => {
      return await fetch.post<{
        coinId: number;
      }>(
        `coin/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`,
        toSnakeCase(coin),
        { headers: { "x-hex-chain-code": vault.hexChainCode } }
      );
    },
    cmc: (address: string): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{
            data: { [cmcId: string]: { id: number } };
          }>(
            `${
              import.meta.env.VITE_VULTISIG_SERVER
            }cmc/v1/cryptocurrency/info?address=${address}&skip_invalid=true&aux=status`
          )
          .then(({ data }) => {
            const [key] = Object.keys(data.data);

            key ? resolve(parseInt(key)) : resolve(0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    del: async (vault: VaultProps, coin: CoinProps) => {
      return await fetch.delete(
        `coin/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}/${coin.id}`,
        { headers: { "x-hex-chain-code": vault.hexChainCode } }
      );
    },
    value: (id: number, currency: Currency): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<CMC.Result>(
            `${
              import.meta.env.VITE_VULTISIG_SERVER
            }cmc/v2/cryptocurrency/quotes/latest?id=${id}&skip_invalid=true&aux=is_active&convert=${currency}`
          )
          .then(({ data }) => {
            if (
              data?.data &&
              data.data[id]?.quote &&
              data.data[id].quote[currency]
            ) {
              resolve(data.data[id].quote[currency].price ?? 0);
            } else {
              resolve(0);
            }
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    values: async (ids: number[], currency: Currency): Promise<CMC.Props> => {
      return new Promise((resolve) => {
        const modifedData: CMC.Props = {};

        fetch
          .get<CMC.Result>(
            `${
              import.meta.env.VITE_VULTISIG_SERVER
            }cmc/v2/cryptocurrency/quotes/latest?id=${ids
              .filter((id) => id > 0)
              .join(",")}&skip_invalid=true&aux=is_active&convert=${currency}`
          )
          .then(({ data }) => {
            Object.entries(data.data).forEach(([key, value]) => {
              modifedData[key] =
                (value.quote[currency] && value.quote[currency].price) ?? 0;
            });

            resolve(modifedData);
          })
          .catch(() => {
            resolve(modifedData);
          });
      });
    },
    coingeckoValue: (ticker: string, currency: Currency): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{ cacao: { [language: string]: number } }>(
            `${
              import.meta.env.VITE_VULTISIG_SERVER
            }coingeicko/api/v3/simple/price?ids=${ticker}&vs_currencies=${currency}`
          )
          .then(({ data }) => {
            resolve(data?.cacao?.[currency.toLowerCase()] ?? 0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    lifiValue: (contractAddress: string): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{ priceUSD: string }>(
            `https://li.quest/v1/token?chain=eth&token=${contractAddress}`
          )
          .then(({ data }) => {
            resolve(parseFloat(data.priceUSD) || 0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    mayachainValue: (): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<string>("https://midgard.mayachain.info/v2/debug/usd")
          .then(({ data }) => {
            const match = /cacaoPriceUSD: (\d+(\.\d+)?)/.exec(data);

            resolve(match ? parseFloat(match[1]) : 0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
  },
  discovery: {
    info: {
      spl: async (tokens: string[]) => {
        return await fetch.post<{
          [address: string]: {
            mint: string;
            tokenList: {
              extensions: { coingeckoId: string };
              image: string;
              name: string;
              symbol: string;
            };
          };
        }>("https://api.solana.fm/v1/tokens", { tokens });
      },
    },
    spl: (address: string): Promise<TokenProps[]> => {
      return new Promise((resolve) => {
        fetch
          .post<{
            result: {
              value: {
                account: {
                  data: {
                    parsed: {
                      info: {
                        isNative: boolean;
                        mint: string;
                        tokenAmount: { amount: string; decimals: number };
                      };
                    };
                  };
                };
              }[];
            };
          }>("https://solana-rpc.publicnode.com", {
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenAccountsByOwner",
            params: [
              address,
              { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
              { encoding: "jsonParsed" },
            ],
          })
          .then(({ data }) => {
            if (data?.result?.value && Array.isArray(data?.result?.value)) {
              const tokens: TokenProps[] = data.result.value
                .filter(
                  (item) =>
                    item?.account?.data?.parsed?.info &&
                    item.account.data.parsed.info.mint &&
                    !item.account.data.parsed.info.isNative
                )
                .map((item) => ({
                  chain: ChainKey.SOLANA,
                  cmcId: 0,
                  contractAddress: item.account.data.parsed.info.mint,
                  decimals: item.account.data.parsed.info.tokenAmount.decimals,
                  hexPublicKey: "EDDSA",
                  isDefault: false,
                  isLocally: false,
                  isNative: false,
                  logo: "",
                  ticker: "",
                }));

              resolve(tokens);
            } else {
              resolve([]);
            }
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
  },
  nft: {
    price: (address: string): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{
            minPrice: {
              currency: string;
              decimals: number;
              value: string;
            };
          }>(`nft/price/${address}`)
          .then(({ data }) => {
            const chain = defTokens.find(
              ({ isNative, ticker }) =>
                isNative && ticker === data.minPrice.currency
            );

            if (chain) {
              api.coin.value(chain.cmcId, Currency.USD).then((chainPrice) => {
                console.log(
                  (parseInt(data.minPrice.value) /
                    Math.pow(10, data.minPrice.decimals)) *
                    chainPrice
                );

                resolve(
                  (parseInt(data.minPrice.value) /
                    Math.pow(10, data.minPrice.decimals)) *
                    chainPrice
                );
              });
            } else {
              resolve(0);
            }
          })
          .catch(() => resolve(0));
      });
    },
    thorguard: {
      identifier: (address: string, data: number): Promise<number> => {
        return new Promise((resolve) => {
          fetch
            .post<{ result: string }>("https://ethereum.publicnode.com", {
              jsonrpc: "2.0",
              method: "eth_call",
              params: [
                {
                  to: nftCollection[CollectionKey.THORGUARD],
                  data: `0x2f745c59000000000000000000000000${address.replace(
                    "0x",
                    ""
                  )}${data.toHexFormat(64)}`,
                },
                "latest",
              ],
              id: uuidv4(),
            })
            .then(({ data }) => {
              resolve(parseInt(data.result));
            })
            .catch(() => resolve(0));
        });
      },

      discover: (
        address: string
      ): Promise<{ nfts: NFTProps[]; price: number }> => {
        return new Promise((resolve) => {
          fetch
            .post<{ result: string }>("https://ethereum.publicnode.com", {
              jsonrpc: "2.0",
              method: "eth_call",
              params: [
                {
                  to: "0xa98b29a8f5a247802149c268ecf860b8308b7291",
                  data: `0x70a08231000000000000000000000000${address.replace(
                    "0x",
                    ""
                  )}`,
                },
                "latest",
              ],
              id: uuidv4(),
            })
            .then(({ data }) => {
              const nfts = Array.from(
                { length: parseInt(data.result) },
                (_, index) => index
              );

              const promises = nfts.map((data) =>
                api.nft.thorguard.identifier(address, data)
              );

              Promise.all(promises).then((identifiers) => {
                api.nft
                  .price(nftCollection[CollectionKey.THORGUARD])
                  .then((price) => {
                    resolve({
                      nfts: identifiers.map((identifier) => ({
                        collection: CollectionKey.THORGUARD,
                        identifier,
                      })),
                      price,
                    });
                  });
              });
            })
            .catch(() => resolve({ nfts: [], price: 0 }));
        });
      },
    },
  },
  vault: {
    add: (params: VaultProps): Promise<VaultProps | undefined> => {
      return new Promise((resolve, reject) => {
        fetch
          .post<VaultProps>("vault", toSnakeCase(params))
          .then(() => {
            api.vault.get(params).then(resolve);
          })
          .catch((error) => {
            if (error === errorKey.VAULT_ALREADY_REGISTERED) {
              api.vault.get(params).then(resolve);
            } else {
              reject();
            }
          });
      });
    },
    del: async (vault: VaultProps) => {
      return await fetch.delete(
        `vault/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`,
        { headers: { "x-hex-chain-code": vault.hexChainCode } }
      );
    },
    get: (vault: VaultProps): Promise<VaultProps | undefined> => {
      return new Promise((resolve) => {
        fetch
          .get<VaultProps>(
            `vault/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`
          )
          .then(({ data }) => {
            resolve({ ...vault, ...data });
          })
          .catch(() => resolve(undefined));
      });
    },
    getById: async (id: string) => {
      return await fetch.get<VaultProps>(`vault/shared/${id}`);
    },
    avatar: (
      params: Pick<
        VaultProps,
        "hexChainCode" | "publicKeyEcdsa" | "publicKeyEddsa" | "uid"
      > & { collectionId: string; itemId: string; url: string }
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        fetch
          .post<void>("nft/avatar", toSnakeCase(params))
          .then(() => resolve())
          .catch(reject);
      });
    },
    rename: async (params: VaultProps) => {
      return await fetch.post(
        `vault/${params.publicKeyEcdsa}/${params.publicKeyEddsa}/alias`,
        toSnakeCase(params)
      );
    },
  },
  sharedSettings: {
    set: async (params: SharedSettings) => {
      return await fetch.post("vault/theme", toSnakeCase(params));
    },
    get: async (uid: string) => {
      return await fetch.get<SharedSettings>(`vault/theme/${uid}`);
    },
  },
  derivePublicKey: async (params: Derivation.Params) => {
    return await fetch.post<Derivation.Props>(
      "derive-public-key",
      toSnakeCase(params)
    );
  },
  leaderboard: async (params: Leaderboard.Params) => {
    return await fetch.get<Leaderboard.Props>(
      `leaderboard/vaults?from=${params.from}&limit=${params.limit}`
    );
  },
  oneInch: async (id: number) => {
    return await fetch.get<OneInch.Props>(
      `${import.meta.env.VITE_VULTISIG_SERVER}1inch/swap/v6.0/${id}/tokens`
    );
  },
};

export default api;
