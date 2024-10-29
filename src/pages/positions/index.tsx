import { FC, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Button, Tooltip } from "antd";

import { useBaseContext } from "context";
import {
  ChainKey,
  defTokens,
  exploreToken,
  LayoutKey,
  PageKey,
  TickerKey,
} from "utils/constants";
import {
  PositionProps,
  VaultOutletContext,
  VaultProps,
} from "utils/interfaces";
import api from "utils/api";
import WeweProvider from "utils/wewe-provider";

import { Synchronize } from "icons";
import VaultDropdown from "components/vault-dropdown";
import PositionItem from "components/position-item";

const Component: FC = () => {
  const { changePage, currency } = useBaseContext();
  const {
    changeVault,
    layout,
    vault,
    vaults,
    updateVault,
    updateVaultPositions,
  } = useOutletContext<VaultOutletContext>();
  const {
    mayaBond,
    mayaLiquidity,
    runeProvider,
    saverPosition,
    tgtStake,
    thorBond,
    thorLiquidity,
    wewePositions,
  } = vault.positions;
  const weweProvider = new WeweProvider();

  const getChain = (
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

  const getCMC = (chain: ChainKey, ticker: string): number => {
    return (
      defTokens.find(
        (token) => token.chain === chain && token.ticker === ticker
      )?.cmcId ?? 0
    );
  };

  const getLiquidityPositions = (vault: VaultProps): Promise<void> => {
    return new Promise((resolve) => {
      const addresses = vault.chains.map((chain) => chain.address).join(",");
      const mayaLiquidity: PositionProps[] = [];
      const thorLiquidity: PositionProps[] = [];

      api.activePositions
        .getLiquidityPositions(addresses)
        .then(({ data }) => {
          data.maya.forEach((item) => {
            const chain = getChain(item.pool);
            const assetAdded = Number(item.assetAdded) ?? 0;
            const runeAdded = Number(item.runeAdded) ?? 0;

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
            const chain = getChain(item.pool);
            const assetAdded = Number(item.assetAdded) ?? 0;
            const runeAdded = Number(item.runeAdded) ?? 0;

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
          updateVaultPositions({
            ...vault,
            positions: { mayaLiquidity, thorLiquidity },
          });

          resolve();
        });
    });
  };

  const getMayaBond = (vault: VaultProps): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault.chains.find(
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

      updateVaultPositions({ ...vault, positions: { mayaBond } });

      resolve();
    });
  };

  const getRuneProvider = (vault: VaultProps, price: number): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault.chains.find(
        ({ name }) => name === ChainKey.THORCHAIN
      )?.address;
      const runeProvider: PositionProps[] = [];

      if (address) {
        api.activePositions
          .getRuneProvider(address)
          .then(({ data }) => {
            const tokenAmount = (Number(data.value) ?? 0) * 1e-8;

            runeProvider.push({
              base: {
                chain: ChainKey.THORCHAIN,
                price: price * tokenAmount,
                tiker: TickerKey.RUNE,
                tokenAddress: `${exploreToken[ChainKey.THORCHAIN]}${address}`,
                tokenAmount: tokenAmount.toBalanceFormat(),
              },
            });
          })
          .finally(() => {
            updateVaultPositions({
              ...vault,
              positions: { runeProvider },
            });

            resolve();
          });
      } else {
        updateVaultPositions({
          ...vault,
          positions: { runeProvider },
        });

        resolve();
      }
    });
  };

  const getSaverPositions = (vault: VaultProps): Promise<void> => {
    return new Promise((resolve) => {
      const addresses = vault.chains.map((chain) => chain.address).join(",");
      const saverPosition: PositionProps[] = [];

      api.activePositions
        .getSaverPositions(addresses)
        .then(({ data }) => {
          const cmcIds: number[] = [];

          data.pools.forEach((item) => {
            const chain = getChain(item.pool);

            if (chain) {
              const id = getCMC(chain.name, chain.ticker);

              if (id) cmcIds.push(id);
            }
          });
          if (cmcIds.length) {
            api.coin
              .values(cmcIds, currency)
              .then((values) => {
                data.pools.forEach((item) => {
                  const chain = getChain(item.pool);

                  if (chain) {
                    const cmcId = getCMC(chain.name, chain.ticker);
                    const tokenAmount = (Number(item.assetRedeem) ?? 0) * 1e-8;

                    saverPosition.push({
                      base: {
                        chain: chain.name,
                        price: (values[cmcId] ?? 0) * tokenAmount,
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
                updateVaultPositions({
                  ...vault,
                  positions: { saverPosition },
                });

                resolve();
              });
          } else {
            updateVaultPositions({
              ...vault,
              positions: { saverPosition },
            });

            resolve();
          }
        })
        .catch(() => {
          updateVaultPositions({
            ...vault,
            positions: { saverPosition },
          });

          resolve();
        });
    });
  };

  const getThorBond = (vault: VaultProps, price: number): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault.chains.find(
        ({ name }) => name === ChainKey.THORCHAIN
      )?.address;
      const thorBond: PositionProps[] = [];

      if (address) {
        api.activePositions
          .nodeInfo()
          .then(({ data }) => {
            const tokenAmount =
              data.reduce((acc, node) => {
                const nodeSum = node?.bondProviders?.providers?.reduce(
                  (sum, provider) => {
                    return provider?.bondAddress === address
                      ? sum + parseInt(provider.bond)
                      : sum;
                  },
                  0
                );

                return acc + nodeSum;
              }, 0) * 1e-8;

            thorBond.push({
              base: {
                chain: ChainKey.THORCHAIN,
                price: price * tokenAmount,
                tiker: TickerKey.RUNE,
                tokenAddress: `${exploreToken[ChainKey.THORCHAIN]}${address}`,
                tokenAmount: tokenAmount.toBalanceFormat(),
              },
            });
          })
          .finally(() => {
            updateVaultPositions({
              ...vault,
              positions: { thorBond },
            });

            resolve();
          });
      } else {
        updateVaultPositions({
          ...vault,
          positions: { thorBond },
        });

        resolve();
      }
    });
  };

  const getTGTStake = (vault: VaultProps, price: number): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault.chains.find(
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
                price: price * data.reward,
                tiker: TickerKey.TGT,
                tokenAddress: `${exploreToken[ChainKey.ARBITRUM]}${address}`,
                tokenAmount: (Number(data.stakedAmount) ?? 0).toBalanceFormat(),
                reward: data.reward,
              },
            });
          })
          .finally(() => {
            updateVaultPositions({
              ...vault,
              positions: { tgtStake },
            });

            resolve();
          });
      } else {
        updateVaultPositions({
          ...vault,
          positions: { tgtStake },
        });

        resolve();
      }
    });
  };

  const getWewePositions = (
    vault: VaultProps,
    price: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault.chains.find(
        ({ name }) => name === ChainKey.BASE
      )?.address;

      const wewePositions: PositionProps[] = [];

      if (address) {
        weweProvider
          .getPositions(address, price)
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
            updateVaultPositions({
              ...vault,
              positions: { wewePositions },
            });

            resolve();
          });
      } else {
        updateVaultPositions({
          ...vault,
          positions: { wewePositions },
        });

        resolve();
      }
    });
  };

  const handleRefresh = (): void => {
    updateVault({ ...vault, positions: {} });
  };

  const componentDidUpdate = (): void => {
    if (!vault.positions.updated) {
      const runeCMCId = getCMC(ChainKey.THORCHAIN, TickerKey.RUNE);
      const tgtCMCId = getCMC(ChainKey.ARBITRUM, TickerKey.TGT);
      const usdtCMCId = getCMC(ChainKey.ETHEREUM, TickerKey.USDT);

      updateVaultPositions({ ...vault, positions: { updated: true } });

      api.coin
        .values([runeCMCId, tgtCMCId, usdtCMCId], currency)
        .then((data) => {
          getLiquidityPositions(vault);
          getMayaBond(vault);
          getRuneProvider(vault, data[runeCMCId] ?? 0);
          getSaverPositions(vault);
          getThorBond(vault, data[runeCMCId] ?? 0);
          getTGTStake(vault, data[tgtCMCId] ?? 0);
          getWewePositions(vault, data[usdtCMCId] ?? 0);
        });
    }
  };

  const componentDidMount = () => {
    changePage(
      layout === LayoutKey.VAULT ? PageKey.POSITIONS : PageKey.SHARED_POSITIONS
    );
  };

  useEffect(componentDidUpdate, [vault]);
  useEffect(componentDidMount, []);

  return (
    <div className="layout-content positions-page">
      {layout === LayoutKey.VAULT && (
        <div className="breadcrumb">
          <VaultDropdown
            vault={vault}
            vaults={vaults}
            changeVault={changeVault}
          />
          <Tooltip title="Refresh">
            <Button type="link" onClick={() => handleRefresh()}>
              <Synchronize />
            </Button>
          </Tooltip>
        </div>
      )}

      <div className="section">
        <span className="heading">Thorchain</span>

        <PositionItem
          data={thorLiquidity}
          text="No Liquidity Position Found"
          title="Liquidity Position"
        />

        <PositionItem
          data={runeProvider}
          text="No Provider Position Found"
          title="Rune Provider"
        />

        <PositionItem
          data={saverPosition}
          text="No Saver Position Found"
          title="Saver"
        />

        <PositionItem data={thorBond} text="No Bond Found" title="Bond" />
      </div>

      <div className="section">
        <h2 className="heading">Maya</h2>

        <PositionItem
          data={mayaLiquidity}
          text="No LP Position Found"
          title="Liquidity Position"
        />

        <PositionItem data={mayaBond} text="No Bond Found" title="Bond" />
      </div>

      <div className="section">
        <h2 className="heading">TGT</h2>

        <PositionItem
          data={tgtStake}
          text="ETH/ARB address not found in your vault"
          title="Stake"
        />
      </div>

      <div className="section">
        <h2 className="heading">WEWE</h2>

        <PositionItem
          data={wewePositions}
          text="WEWE/USDT address not found in your vault"
          title="Positions"
        />
      </div>
    </div>
  );
};

export default Component;
