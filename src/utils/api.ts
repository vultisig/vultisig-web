import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { toCamelCase, toSnakeCase } from "utils/functions";
import { ChainKey, Currency, errorKey } from "utils/constants";
import {
  CoinParams,
  CoinProps,
  SharedSettings,
  TokenProps,
  VaultProps,
} from "utils/interfaces";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_ADDRESS,
  headers: { accept: "application/json" },
});

api.interceptors.request.use(
  (config) => config,
  (error) => {
    return Promise.reject(error.response);
  }
);

api.interceptors.response.use(
  (response) => {
    response.data = toCamelCase(response.data);

    return response;
  },
  ({ response }) => {
    return Promise.reject(response.data.error);
  }
);

namespace CMC {
  export interface ID {
    data: { [cmcId: string]: { id: number } };
  }

  export interface Value {
    data: {
      [id: string]: { quote: { [currency: string]: { price: number } } };
    };
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

export interface NodeInfo {
  bondProviders: {
    providers: {
      bondAddress: string;
      bond: string;
    }[];
  };
}

export interface activePosition {
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

export interface TGT {
  stakedAmount: number;
  reward: number;
}

export interface RuneProvider {
  value: number;
}

const service = {
  airdrop: {
    join: async (params: VaultProps) => {
      return await api.post("vault/join-airdrop", toSnakeCase(params));
    },
    exit: async (params: VaultProps) => {
      return await api.post("vault/exit-airdrop", toSnakeCase(params));
    },
  },
  activePositions: {
    nodeInfo: async () => {
      return await api.get<NodeInfo[]>(
        `https://thornode.ninerealms.com/thorchain/nodes`
      );
    },
    get: async (address: string) => {
      return await api.get<activePosition>(
        `https://api-v2-prod.thorwallet.org/pools/positions?addresses=${address}`
      );
    },
    getTGTstake: async (address: string) => {
      return await api.get<TGT>(
        `https://api-v2-prod.thorwallet.org/stake/${address}`
      );
    },
    getRuneProvider: async (address: string) => {
      return await api.get<RuneProvider>(
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
        api
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
        api
          .post<{ id: number; jsonrpc: string; result: string }>(path, {
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
            id: uuidv4(),
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
        api
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
        api
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
    utxo: (
      path: string,
      address: string,
      decimals: number
    ): Promise<number> => {
      return new Promise((resolve) => {
        api
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
      return await api.post<{
        coinId: number;
      }>(
        `coin/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`,
        toSnakeCase(coin),
        { headers: { "x-hex-chain-code": vault.hexChainCode } }
      );
    },
    cmc: async (address: string) => {
      return await api.get<CMC.ID>(
        `https://api.vultisig.com/cmc/v1/cryptocurrency/info?address=${address}&skip_invalid=true&aux=status`
      );
    },
    del: async (vault: VaultProps, coin: CoinProps) => {
      return await api.delete(
        `coin/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}/${coin.id}`,
        { headers: { "x-hex-chain-code": vault.hexChainCode } }
      );
    },
    value: (id: number, currency: Currency): Promise<number> => {
      return new Promise((resolve) => {
        api
          .get<CMC.Value>(
            `https://api.vultisig.com/cmc/v2/cryptocurrency/quotes/latest?id=${id}&skip_invalid=true&aux=is_active&convert=${currency}`
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
    values: async (ids: number[], currency: Currency) => {
      return await api.get<CMC.Value>(
        `https://api.vultisig.com/cmc/v2/cryptocurrency/quotes/latest?id=${ids
          .filter((id) => id > 0)
          .join(",")}&skip_invalid=true&aux=is_active&convert=${currency}`
      );
    },
    coingeckoValue: async (priceProviderId: string, currency: Currency) => {
      return await api.get<{ cacao: { [language: string]: number } }>(
        `https://api.vultisig.com/coingeicko/api/v3/simple/price?ids=${priceProviderId}&vs_currencies=${currency}`
      );
    },
    lifiValue: (contractAddress: string): Promise<number> => {
      return new Promise((resolve) => {
        api
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
  },
  discovery: {
    info: {
      spl: async (tokens: string[]) => {
        return await api.post<{
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
    spl: async (address: string): Promise<TokenProps[]> => {
      return new Promise((resolve) => {
        api
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
  vault: {
    add: (params: VaultProps): Promise<VaultProps> => {
      return new Promise((resolve, reject) => {
        api
          .post<VaultProps>("vault", toSnakeCase(params))
          .then(() => {
            service.vault
              .get(params)
              .then(({ data }) => resolve(data))
              .catch(reject);
          })
          .catch((error) => {
            if (error === errorKey.VAULT_ALREADY_REGISTERED) {
              service.vault
                .get(params)
                .then(({ data }) => resolve(data))
                .catch(reject);
            } else {
              reject();
            }
          });
      });
    },
    del: async (vault: VaultProps) => {
      return await api.delete(
        `vault/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`,
        { headers: { "x-hex-chain-code": vault.hexChainCode } }
      );
    },
    get: async (params: VaultProps) => {
      return await api.get<VaultProps>(
        `vault/${params.publicKeyEcdsa}/${params.publicKeyEddsa}`
      );
    },
    getById: async (id: string) => {
      return await api.get<VaultProps>(`vault/shared/${id}`);
    },
    rename: async (params: VaultProps) => {
      return await api.post(
        `vault/${params.publicKeyEcdsa}/${params.publicKeyEddsa}/alias`,
        toSnakeCase(params)
      );
    },
  },
  sharedSettings: {
    set: async (params: SharedSettings) => {
      return await api.post("vault/theme", toSnakeCase(params));
    },
    get: async (uid: string) => {
      return await api.get<SharedSettings>(`vault/theme/${uid}`);
    },
  },
  derivePublicKey: async (params: Derivation.Params) => {
    return await api.post<Derivation.Props>(
      "derive-public-key",
      toSnakeCase(params)
    );
  },
  leaderboard: async (params: Leaderboard.Params) => {
    return await api.get<Leaderboard.Props>(
      `leaderboard/vaults?from=${params.from}&limit=${params.limit}`
    );
  },
  oneInch: async (id: number) => {
    return await api.get<OneInch.Props>(
      `https://api.vultisig.com/1inch/swap/v6.0/${id}/tokens`
    );
  },
};

export default service;
