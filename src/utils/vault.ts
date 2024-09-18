import { v4 as uuidv4 } from "uuid";

import { Chain, Currency, balanceAPI, storageKey } from "utils/constants";
import { CoinProps, VaultProps } from "utils/interfaces";
import api from "utils/api";

export const getBalance = (
  coin: CoinProps,
  chain: Chain,
  address: string
): Promise<CoinProps> => {
  return new Promise((resolve) => {
    const uid = uuidv4();
    const path = balanceAPI[chain];

    switch (chain) {
      // Cosmos
      case Chain.DYDX: {
        getAmount(path, address, "adydx", coin, resolve);
        break;
      }
      case Chain.GAIACHAIN: {
        getAmount(path, address, "uatom", coin, resolve);
        break;
      }
      case Chain.KUJIRA: {
        getAmount(path, address, "ukuji", coin, resolve);
        break;
      }
      case Chain.MAYACHAIN: {
        getAmount(path, address, "cacao", coin, resolve);
        break;
      }
      case Chain.THORCHAIN: {
        getAmount(path, address, "rune", coin, resolve);
        break;
      }
      // EVM
      case Chain.ARBITRUM:
      case Chain.AVALANCHE:
      case Chain.BASE:
      case Chain.BLAST:
      case Chain.BSCCHAIN:
      case Chain.CRONOSCHAIN:
      case Chain.ETHEREUM:
      case Chain.OPTIMISM:
      case Chain.POLYGON: {
        api.balance
          .evm(path, {
            jsonrpc: "2.0",
            method: coin.isNative ? "eth_getBalance" : "eth_call",
            params: [
              coin.isNative
                ? address
                : {
                    data: `0x70a08231000000000000000000000000${address.replace(
                      "0x",
                      ""
                    )}`,
                    to: coin.contractAddress,
                  },
              "latest",
            ],
            id: uid,
          })
          .then(({ data }) => {
            resolve({
              ...coin,
              balance:
                (data.result ? parseInt(data.result, 16) : 0) /
                Math.pow(10, coin.decimals),
            });
          })
          .catch(() => {
            resolve({ ...coin, balance: 0 });
          });

        break;
      }
      case Chain.POLKADOT: {
        api.balance
          .polkadot(path, { key: address })
          .then(({ data: { data } }) => {
            if (data && data.account && data.account.balance) {
              const balance = data.account.balance;

              resolve({
                ...coin,
                balance: parseFloat(balance),
              });
            } else {
              resolve({ ...coin, balance: 0 });
            }
          })
          .catch(() => {
            resolve({ ...coin, balance: 0 });
          });

        break;
      }
      case Chain.SOLANA: {
        api.balance
          .solana(path, {
            jsonrpc: "2.0",
            method: coin.isNative ? "getBalance" : "getTokenAccountsByOwner",
            params: coin.isNative
              ? [address]
              : [
                  address,
                  { mint: coin.contractAddress },
                  { encoding: "jsonParsed" },
                ],
            id: uid,
          })
          .then(({ data }) => {
            let balance = 0;

            if (Array.isArray(data.result.value)) {
              const [value] = data.result.value;

              if (value?.account?.data?.parsed?.info?.tokenAmount?.amount) {
                balance =
                  value.account.data.parsed.info.tokenAmount.amount /
                  Math.pow(10, coin.decimals);
              }
            } else {
              balance = data.result.value / Math.pow(10, coin.decimals);
            }

            resolve({ ...coin, balance });
          })
          .catch(() => {
            resolve({ ...coin, balance: 0 });
          });

        break;
      }
      // UTXO
      case Chain.BITCOIN:
      case Chain.BITCOINCASH:
      case Chain.DASH:
      case Chain.DOGECOIN:
      case Chain.LITECOIN: {
        api.balance
          .utxo(`${path}/${address}?state=latest`)
          .then(({ data: { data } }) => {
            if (
              data &&
              data[address] &&
              data[address].address &&
              typeof data[address].address.balance === "number"
            ) {
              resolve({
                ...coin,
                balance:
                  data[address].address.balance / Math.pow(10, coin.decimals),
              });
            } else {
              resolve({ ...coin, balance: 0 });
            }
          })
          .catch(() => {
            resolve({ ...coin, balance: 0 });
          });

        break;
      }
      default:
        resolve({ ...coin, balance: 0 });
        break;
    }
  });
};

export const getValue = (
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

export const getVaults = (): VaultProps[] => {
  try {
    const data = localStorage.getItem(storageKey.VAULTS);
    const vaults: VaultProps[] = data ? JSON.parse(data) : [];

    return Array.isArray(vaults) ? vaults : [];
  } catch {
    return [];
  }
};

export const setVaults = (vaults: VaultProps[]): void => {
  localStorage.setItem(storageKey.VAULTS, JSON.stringify(vaults));
};

export const getAmount = (path: string, address: string, dom: string, coin: CoinProps, resolve: any): void => {
  api.balance
    .cosmos(`${path}/${address}`)
    .then(({ data: { balances } }) => {
      const amount = balances.find(({ denom }) => denom === dom)?.amount;
      if (amount) {
        resolve({
          ...coin,
          balance:
            parseInt(amount) / Math.pow(10, coin.decimals),
        });
      } else {
        resolve({ ...coin, balance: 0 });
      }
    })
    .catch(() => {
      resolve({ ...coin, balance: 0 });
    });
}
