import axios from "axios";

import { toCamelCase, toSnakeCase } from "utils/functions";
import { Currency, errorKey } from "utils/constants";
import { CoinParams, CoinProps, VaultProps } from "utils/interfaces";

//import paths from "routes/constant-paths";

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

namespace Balance {
  export namespace Cosmos {
    export interface Props {
      balances: {
        denom: string;
        amount: string;
      }[];
    }
  }

  export namespace EVM {
    export interface Params {
      jsonrpc: string;
      method: string;
      params: [string | { to: string; data: string }, string];
      id: string;
    }

    export interface Props {
      id: number;
      jsonrpc: string;
      result: string;
    }
  }

  export namespace Polkadot {
    export interface Params {
      key: string;
    }

    export interface Props {
      data: { account: { balance: string } };
    }
  }

  export namespace Solana {
    export interface Params {
      jsonrpc: string;
      method: string;
      params: [string] | [string, { mint: string }, { encoding: string }];
      id: string;
    }

    export interface Props {
      result: {
        value:
          | number
          | {
              account: {
                data: { parsed: { info: { tokenAmount: { amount: number } } } };
              };
            }[];
      };
    }
  }

  export namespace UTXO {
    export interface Props {
      data: { [address: string]: { address: { balance: number } } };
    }
  }
}

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

namespace Coin {
  export interface Props {
    coinId: number;
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

namespace Discovery {
  export namespace Info {
    export interface SPL {
      [address: string]: {
        mint: string;
        tokenList: {
          extensions: { coingeckoId: string };
          image: string;
          name: string;
          symbol: string;
        };
      };
    }
  }

  export interface SPL {
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

export default {
  airdrop: {
    join: async (params: VaultProps) => {
      return await api.post("vault/join-airdrop", toSnakeCase(params));
    },
    exit: async (params: VaultProps) => {
      return await api.post("vault/exit-airdrop", toSnakeCase(params));
    },
  },
  balance: {
    cosmos: async (path: string) => {
      return await api.get<Balance.Cosmos.Props>(path);
    },
    evm: async (path: string, params: Balance.EVM.Params) => {
      return await api.post<Balance.EVM.Props>(path, params);
    },
    polkadot: async (path: string, params: Balance.Polkadot.Params) => {
      return await api.post<Balance.Polkadot.Props>(path, params);
    },
    solana: async (path: string, params: Balance.Solana.Params) => {
      return await api.post<Balance.Solana.Props>(path, params);
    },
    utxo: async (path: string) => {
      return await api.get<Balance.UTXO.Props>(path);
    },
  },
  coin: {
    add: async (vault: VaultProps, coin: CoinParams) => {
      return await api.post<Coin.Props>(
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
    values: async (ids: number[], currency: Currency) => {
      return await api.get<CMC.Value>(
        `https://api.vultisig.com/cmc/v2/cryptocurrency/quotes/latest?id=${ids
          .filter((id) => id > 0)
          .join(",")}&skip_invalid=true&aux=is_active&convert=${currency}`
      );
    },
    coingeckoValue: async (priceProviderId:string, currency: Currency) => {
      return await api.get<{ cacao: { [language: string]: number } }>(
        `https://api.vultisig.com/coingeicko/api/v3/simple/price?ids=${priceProviderId}&vs_currencies=${currency}`
      );
    },
  },
  discovery: {
    info: {
      spl: async (tokens: string[]) => {
        return await api.post<Discovery.Info.SPL>(
          "https://api.solana.fm/v1/tokens",
          { tokens }
        );
      },
    },
    spl: async (address: string) => {
      return await api.post<Discovery.SPL>(
        "https://solana-rpc.publicnode.com",
        {
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            address,
            { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
            { encoding: "jsonParsed" },
          ],
        }
      );
    },
  },
  vault: {
    add: (params: VaultProps): Promise<void> => {
      return new Promise((resolve, reject) => {
        api
          .post("vault", toSnakeCase(params))
          .then(() => {
            resolve();
          })
          .catch((error) => {
            error === errorKey.VAULT_ALREADY_REGISTERED ? resolve() : reject();
          });
      });
    },
    del: async (vault: VaultProps) => {
      return await api.delete(
        `vault/${vault.publicKeyEcdsa}/${vault.publicKeyEddsa}`,
        { headers: { "x-hex-chain-code": vault.hexChainCode } }
      );
    },
    get: async ({ publicKeyEcdsa, publicKeyEddsa }: VaultProps) => {
      return await api.get<VaultProps>(
        `vault/${publicKeyEcdsa}/${publicKeyEddsa}`
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
  derivePublicKey: async (params: Derivation.Params) => {
    return await api.post<Derivation.Props>(
      "derive-public-key",
      toSnakeCase(params)
    );
  },
  oneInch: async (id: number) => {
    return await api.get<OneInch.Props>(
      `https://api.vultisig.com/1inch/swap/v6.0/${id}/tokens`
    );
  },
};
