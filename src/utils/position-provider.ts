import {
  ChainKey,
  Currency,
  TickerKey,
  defTokens,
  exploreToken,
} from "utils/constants";
import { PositionProps, VaultProps } from "utils/interfaces";
import api from "utils/api";
import WeweProvider from "utils/wewe-provider";

export default class PositionProvider {
  private vault: VaultProps;
  private weweProvider: WeweProvider;
  private runePrice?: number;
  private tgtPrice?: number;
  private usdtPrice?: number;

  constructor(vault: VaultProps) {
    this.vault = vault;
    this.weweProvider = new WeweProvider();
  }

  private getChain = (
    pool: string
  ): { name: ChainKey; ticker: string } | false => {
    const [chain, str] = pool.split(".");
    const [ticker] = str.split("-");
    let name: ChainKey;

    switch (chain) {
      case "ARB":
        name = ChainKey.ARBITRUM;
        break;
      case "AVAX":
        name = ChainKey.AVALANCHE;
        break;
      case "BCH":
        name = ChainKey.BITCOINCASH;
        break;
      case "BSC":
        name = ChainKey.BSCCHAIN;
        break;
      case "BTC":
        name = ChainKey.BITCOIN;
        break;
      case "DASH":
        name = ChainKey.DASH;
        break;
      case "DOGE":
        name = ChainKey.DOGECOIN;
        break;
      case "ETH":
        name = ChainKey.ETHEREUM;
        break;
      case "GAIA":
        name = ChainKey.GAIACHAIN;
        break;
      case "KUJI":
        name = ChainKey.KUJIRA;
        break;
      case "LTC":
        name = ChainKey.LITECOIN;
        break;
      case "MAYA":
        name = ChainKey.MAYACHAIN;
        break;
      case "THOR":
        name = ChainKey.THORCHAIN;
        break;
      default:
        return false;
    }

    return { name, ticker };
  };

  private getCMC = (chain: ChainKey, ticker: string): number => {
    return (
      defTokens.find(
        (token) => token.chain === chain && token.ticker === ticker
      )?.cmcId || 0
    );
  };

  public getLiquidityPositions = (): Promise<{
    mayaLiquidity: PositionProps[];
    thorLiquidity: PositionProps[];
  }> => {
    return new Promise((resolve) => {
      const addresses = this.vault.chains
        .map((chain) => chain.address)
        .join(",");
      const mayaLiquidity: PositionProps[] = [];
      const thorLiquidity: PositionProps[] = [];

      api.activePositions
        .getLiquidityPositions(addresses)
        .then(({ data }) => {
          data.maya.forEach((item) => {
            const chain = this.getChain(item.pool);
            const assetAdded = Number(item.assetAdded) || 0;
            const runeAdded = Number(item.runeAdded) || 0;

            if (chain) {
              mayaLiquidity.push({
                base: {
                  chain: chain.name,
                  price: item.assetPriceUsd * item.assetAdded,
                  tiker: chain.ticker,
                  tokenAddress: `${exploreToken[ChainKey.MAYACHAIN]}${
                    item.runeAddress || item.assetAddress
                  }`,
                  tokenAmount: assetAdded.toBalanceFormat(),
                },
                target: {
                  chain: ChainKey.MAYACHAIN,
                  price: item.runeOrCacaoPricePriceUsd * runeAdded,
                  tiker: TickerKey.CACAO,
                  tokenAddress: `${exploreToken[ChainKey.MAYACHAIN]}${
                    item.runeAddress || item.assetAddress
                  }`,
                  tokenAmount: runeAdded.toBalanceFormat(),
                },
              });
            }
          });

          data.thorchain.forEach((item) => {
            const chain = this.getChain(item.pool);
            const assetAdded = Number(item.assetAdded) || 0;
            const runeAdded = Number(item.runeAdded) || 0;

            if (chain) {
              thorLiquidity.push({
                base: {
                  chain: chain.name,
                  price: item.assetPriceUsd * assetAdded,
                  tiker: chain.ticker,
                  tokenAddress: `${exploreToken[ChainKey.THORCHAIN]}${
                    item.runeAddress || item.assetAddress
                  }`,
                  tokenAmount: assetAdded.toBalanceFormat(),
                },
                target: {
                  chain: ChainKey.THORCHAIN,
                  price: item.runeOrCacaoPricePriceUsd * runeAdded,
                  tiker: TickerKey.RUNE,
                  tokenAddress: `${exploreToken[ChainKey.THORCHAIN]}${
                    item.runeAddress || item.assetAddress
                  }`,
                  tokenAmount: runeAdded.toBalanceFormat(),
                },
              });
            }
          });
        })
        .finally(() => {
          resolve({ mayaLiquidity, thorLiquidity });
        });
    });
  };

  public getMayaBond = (): Promise<{ mayaBond: PositionProps[] }> => {
    return new Promise((resolve) => {
      const address = this.vault.chains.find(
        ({ name }) => name === ChainKey.MAYACHAIN
      )?.address;
      const mayaBond: PositionProps[] = [];

      if (address) {
        mayaBond.push({
          base: {
            chain: ChainKey.MAYACHAIN,
            price: 0,
            tiker: TickerKey.MAYA,
            tokenAddress: `${exploreToken[ChainKey.MAYACHAIN]}${address}`,
            tokenAmount: "0",
          },
        });
      }

      resolve({ mayaBond });
    });
  };

  public getRuneProvider = (): Promise<{ runeProvider: PositionProps[] }> => {
    return new Promise((resolve) => {
      const address = this.vault.chains.find(
        ({ name }) => name === ChainKey.THORCHAIN
      )?.address;
      const runeProvider: PositionProps[] = [];

      if (address) {
        api.activePositions
          .getRuneProvider(address)
          .then((tokenAmount) => {
            runeProvider.push({
              base: {
                chain: ChainKey.THORCHAIN,
                price: (this.runePrice || 0) * tokenAmount,
                tiker: TickerKey.RUNE,
                tokenAddress: `${exploreToken[ChainKey.THORCHAIN]}${address}`,
                tokenAmount: tokenAmount.toBalanceFormat(),
              },
            });
          })
          .finally(() => {
            resolve({ runeProvider });
          });
      } else {
        resolve({ runeProvider });
      }
    });
  };

  public getSaverPositions = (): Promise<{
    saverPosition: PositionProps[];
  }> => {
    return new Promise((resolve) => {
      const addresses = this.vault.chains
        .map((chain) => chain.address)
        .join(",");
      const saverPosition: PositionProps[] = [];

      api.activePositions
        .getSaverPositions(addresses)
        .then(({ data }) => {
          const cmcIds: number[] = [];

          data.pools.forEach((item) => {
            const chain = this.getChain(item.pool);

            if (chain) {
              const id = this.getCMC(chain.name, chain.ticker);

              if (id) cmcIds.push(id);
            }
          });
          if (cmcIds.length) {
            api.coin
              .values(cmcIds, Currency.USD)
              .then((values) => {
                data.pools.forEach((item) => {
                  const chain = this.getChain(item.pool);

                  if (chain) {
                    const cmcId = this.getCMC(chain.name, chain.ticker);
                    const tokenAmount = (Number(item.assetRedeem) || 0) * 1e-8;

                    saverPosition.push({
                      base: {
                        chain: chain.name,
                        price: (values[cmcId] || 0) * tokenAmount,
                        tiker: chain.ticker,
                        tokenAddress: `${exploreToken[ChainKey.THORCHAIN]}${
                          item.assetAddress
                        }`,
                        tokenAmount: tokenAmount.toBalanceFormat(),
                      },
                    });
                  }
                });
              })
              .finally(() => {
                resolve({ saverPosition });
              });
          } else {
            resolve({ saverPosition });
          }
        })
        .catch(() => {
          resolve({ saverPosition });
        });
    });
  };

  public getThorBond = (): Promise<{ thorBond: PositionProps[] }> => {
    return new Promise((resolve) => {
      const address = this.vault.chains.find(
        ({ name }) => name === ChainKey.THORCHAIN
      )?.address;
      const thorBond: PositionProps[] = [];

      if (address) {
        api.activePositions
          .nodeInfo(address)
          .then((tokenAmount) => {
            thorBond.push({
              base: {
                chain: ChainKey.THORCHAIN,
                price: (this.runePrice || 0) * tokenAmount,
                tiker: TickerKey.RUNE,
                tokenAddress: `${exploreToken[ChainKey.THORCHAIN]}${address}`,
                tokenAmount: tokenAmount.toBalanceFormat(),
              },
            });
          })
          .finally(() => {
            resolve({ thorBond });
          });
      } else {
        resolve({ thorBond });
      }
    });
  };

  public getTGTStake = (): Promise<{ tgtStake: PositionProps[] }> => {
    return new Promise((resolve) => {
      const address = this.vault.chains.find(
        ({ name }) => name === ChainKey.ARBITRUM
      )?.address;
      const tgtStake: PositionProps[] = [];

      if (address) {
        api.activePositions
          .getTGTstake(address)
          .then(({ data }) => {
            tgtStake.push({
              base: {
                chain: ChainKey.ARBITRUM,
                price:
                  (this.tgtPrice || 0) * data.stakedAmount +
                  data.reward * (this.usdtPrice || 0),
                tiker: TickerKey.TGT,
                tokenAddress: `${exploreToken[ChainKey.ARBITRUM]}${address}`,
                tokenAmount: (Number(data.stakedAmount) || 0).toBalanceFormat(),
                reward: data.reward,
              },
            });
          })
          .finally(() => {
            resolve({ tgtStake });
          });
      } else {
        resolve({ tgtStake });
      }
    });
  };

  public getWewePositions = (): Promise<{ wewePositions: PositionProps[] }> => {
    return new Promise((resolve) => {
      const address = this.vault.chains.find(
        ({ name }) => name === ChainKey.BASE
      )?.address;

      const wewePositions: PositionProps[] = [];

      if (address) {
        this.weweProvider
          .getPositions(address, this.runePrice || 0)
          .then((positions) => {
            positions.forEach((position) => {
              wewePositions.push({
                base: {
                  chain: ChainKey.BASE,
                  price: position.value,
                  tiker: TickerKey.WEWE,
                  tokenAddress: `${exploreToken[ChainKey.BASE]}${address}`,
                  tokenAmount: position.shares,
                },
              });
            });
          })
          .finally(() => {
            resolve({ wewePositions });
          });
      } else {
        resolve({ wewePositions });
      }
    });
  };

  public getPrerequisites = (): Promise<void> => {
    return new Promise((resolve) => {
      const runeCMCId = this.getCMC(ChainKey.THORCHAIN, TickerKey.RUNE);
      const tgtCMCId = this.getCMC(ChainKey.ARBITRUM, TickerKey.TGT);
      const usdtCMCId = this.getCMC(ChainKey.ETHEREUM, TickerKey.USDT);

      api.coin
        .values([runeCMCId, tgtCMCId, usdtCMCId], Currency.USD)
        .then((data) => {
          this.runePrice = data[runeCMCId];
          this.tgtPrice = data[tgtCMCId];
          this.usdtPrice = data[usdtCMCId];
        })
        .finally(resolve);
    });
  };
}
