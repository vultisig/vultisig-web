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
import { decodeBase58 } from "ethers";

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
    totalBalance: number;
    totalLp: number;
    totalNft: number;
    totalVaultCount: number;
  }
}

interface OneInchProps {
  [address: string]: {
    decimals: number;
    logoURI: string;
    name: string;
    symbol: string;
  };
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

const externalAPI = {
  ethereumPN: "https://ethereum.publicnode.com",
  lifi: "https://li.quest/v1/",
  mayachain: "https://midgard.mayachain.info/v2/",
  midgardNinerealms: "https://midgard.ninerealms.com/",
  solanaFM: "https://api.solana.fm/v1/",
  solanaPN: "https://solana-rpc.publicnode.com",
  thorchain: "https://thornode.ninerealms.com/thorchain/",
  thorwallet: "https://api-v2-prod.thorwallet.org/",
  trongrid: "https://api.trongrid.io/jsonrpc",
};

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
    nodeInfo: (address: string): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<NodeInfo[]>(`${externalAPI.thorchain}nodes`)
          .then(({ data }) => {
            const amount = data.reduce((acc, node) => {
              const nodeSum =
                node?.bondProviders?.providers?.reduce(
                  (sum, provider) =>
                    provider?.bondAddress === address
                      ? sum + parseInt(provider.bond)
                      : sum,
                  0
                ) || 0;

              return acc + nodeSum;
            }, 0);

            resolve(amount > 0 ? amount * 1e-8 : amount);
          })
          .catch(() => resolve(0));
      });
    },
    getLiquidityPositions: async (addresses: string) => {
      return await fetch.get<ActivePositions>(
        `${externalAPI.thorwallet}pools/positions?addresses=${addresses}`
      );
    },
    getSaverPositions: async (addresses: string) => {
      return await fetch
        .get<{
          pools: { assetRedeem: string; assetAddress: string; pool: string }[];
        }>(`${externalAPI.midgardNinerealms}v2/saver/${addresses}`)
        .then(({ data }) => data.pools || [])
        .catch(() => []);
    },
    getTGTstake: async (address: string) => {
      return await fetch.get<{ stakedAmount: number; reward: number }>(
        `${externalAPI.thorwallet}stake/${address}`
      );
    },
    getRuneProvider: (address: string): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{ value: string }>(
            `${externalAPI.thorchain}rune_provider/${address}`
          )
          .then(({ data }) => {
            const result = parseInt(data?.value);

            resolve(result ? result / Math.pow(10, 8) : 0);
          });
      });
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
          .post<{ result: string }>(path, {
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
            const result = parseInt(data?.result, 16);

            resolve(result ? result / Math.pow(10, decimals) : 0);
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
            resolve(parseFloat(data?.data?.account?.balance || "0"));
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
                value?.account?.data?.parsed?.info?.tokenAmount?.amount || 0;
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
            const balance = parseFloat(data?.balance || "0");

            resolve(balance >= 0 ? balance / Math.pow(10, decimals) : 0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    tron: (
      path: string,
      address: string,
      decimals: number,
      contract: string,
      isNative: boolean
    ): Promise<number> => {
      return new Promise((resolve) => {
        if (isNative) {
          fetch
            .post<{ balance: number }>(path, { address, visible: true })
            .then(({ data }) => {
              resolve(
                data?.balance >= 0 ? data.balance / Math.pow(10, decimals) : 0
              );
            })
            .catch(() => {
              resolve(0);
            });
        } else {
          const hexAddress = decodeBase58(address).toString(16).slice(0, -8);
          const hexContract = decodeBase58(contract).toString(16).slice(0, -8);

          fetch
            .post<{ result: string }>(externalAPI.trongrid, {
              method: "eth_call",
              params: [
                {
                  from: `0x${hexAddress}`,
                  to: `0x${hexContract}`,
                  gas: "0x0",
                  gasPrice: "0x0",
                  value: "0x0",
                  data: `0x70a082310000000000000000000000${hexAddress}`,
                },
                "latest",
              ],
              jsonrpc: "2.0",
              id: uuidv4(),
            })
            .then(({ data }) => {
              const result = parseInt(data?.result, 16);

              resolve(result ? result / Math.pow(10, decimals) : 0);
            })
            .catch(() => {
              resolve(0);
            });
        }
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
    xrp: (path: string, address: string, decimals: number): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .post<{ result: { accountData: { Balance: string } } }>(path, {
            method: "account_info",
            params: [
              { account: address, ledger_index: "current", queue: true },
            ],
          })
          .then(({ data }) => {
            const balance = parseFloat(
              data?.result?.accountData?.Balance || "0"
            );

            resolve(balance >= 0 ? balance / Math.pow(10, decimals) : 0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
  },
  coin: {
    add: async (vault: VaultProps, coin: CoinParams) => {
      return await fetch
        .post<{ coinId: number }>(
          `coin/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`,
          toSnakeCase(coin),
          { headers: { "x-hex-chain-code": vault.hexChainCode } }
        )
        .then(({ data }) => data.coinId);
    },
    cmc: async (address: string): Promise<number> => {
      return fetch
        .get<{
          data: { [cmcId: string]: { id: number } };
        }>(
          `${
            import.meta.env.VITE_VULTISIG_SERVER
          }cmc/v1/cryptocurrency/info?address=${address}&skip_invalid=true&aux=status`
        )
        .then(({ data }) => {
          const [key] = Object.keys(data.data);

          return key ? parseInt(key) : 0;
        })
        .catch(() => 0);
    },
    del: async (vault: VaultProps, coin: CoinProps) => {
      return await fetch.delete(
        `coin/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}/${coin.id}`,
        { headers: { "x-hex-chain-code": vault.hexChainCode } }
      );
    },
    value: async (id: number, currency: Currency) => {
      return fetch
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
            return data.data[id].quote[currency].price || 0;
          } else {
            return 0;
          }
        })
        .catch(() => 0);
    },
    values: async (ids: number[], currency: Currency) => {
      const modifedData: CMC.Props = {};

      return fetch
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
              (value.quote[currency] && value.quote[currency].price) || 0;
          });

          return modifedData;
        })
        .catch(() => modifedData);
    },
    coingeckoValue: (ticker: string, currency: Currency): Promise<number> => {
      return new Promise((resolve) => {
        fetch
          .get<{ [ticker: string]: { [language: string]: number } }>(
            `${
              import.meta.env.VITE_VULTISIG_SERVER
            }coingeicko/api/v3/simple/price?ids=${ticker}&vs_currencies=${currency}`
          )
          .then(({ data }) => {
            resolve(data[ticker.toLowerCase()]?.[currency.toLowerCase()] || 0);
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
            `${externalAPI.lifi}token?chain=eth&token=${contractAddress}`
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
          .get<string>(`${externalAPI.mayachain}debug/usd`)
          .then(({ data }) => {
            const match = /cacaoPriceUSD: (\d+(\.\d+)?)/.exec(data);

            resolve(match ? parseFloat(match[1]) : 0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    getInfo: async (chainId: number, contractAddresses: string[]) => {
      return await fetch
        .get<OneInchProps>(
          `${
            import.meta.env.VITE_VULTISIG_SERVER
          }1inch/token/v1.2/${chainId}/custom?addresses=${contractAddresses.join(
            ","
          )}`
        )
        .then(({ data }) => data);
    },
  },
  discovery: {
    tokens: async (path: string, address: string) => {
      return fetch
        .post<{
          result: {
            tokenBalances: [{ contractAddress: string; tokenBalance: string }];
          };
        }>(path, {
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [address, "erc20"],
          id: uuidv4(),
        })
        .then(({ data }) => data?.result?.tokenBalances || [])
        .catch(() => []);
    },
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
        }>(`${externalAPI.solanaFM}tokens`, { tokens });
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
          }>(externalAPI.solanaPN, {
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
            .post<{ result: string }>(externalAPI.ethereumPN, {
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
            .post<{ result: string }>(externalAPI.ethereumPN, {
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
    get: (vault: VaultProps) => {
      return fetch
        .get<VaultProps>(
          `vault/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`
        )
        .then(({ data }) => ({ ...vault, ...data }))
        .catch(() => undefined);
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
    return await fetch
      .get<{ tokens: OneInchProps }>(
        `${import.meta.env.VITE_VULTISIG_SERVER}1inch/swap/v6.0/${id}/tokens`
      )
      .then(({ data }) => data);
  },
  swap: async (params: Leaderboard.Params) => {
    return await fetch.get<{
      vaults: VaultProps[];
      totalSwapVolume: number;
      totalVaultCount: number;
    }>(`leaderboard/swap/vaults?from=${params.from}&limit=${params.limit}`);
  },
};

export default api;
