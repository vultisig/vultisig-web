import { FC, useState, useEffect } from "react";

import { Button, Tooltip } from "antd";
import { useBaseContext } from "context/base";
import { useVaultContext } from "context/vault";
import {
  ChainKey,
  defTokens,
  MayaChainKey,
  PositionInfo,
  TCChainKey,
} from "utils/constants";

import api, { NodeInfo } from "utils/api";
import { Synchronize } from "icons";
import VaultDropdown from "components/vault-dropdown";
import VultiLoading from "components/vulti-loading";
import PositionItem from "components/position-item";
import NoData from "components/no-data";

interface activePositions {
  maya: PositionInfo[];
  thorchain: PositionInfo[];
}

interface InitialState {
  loading?: boolean;
  liquidityPosition?: activePositions;
  mayaBond?: PositionInfo[];
  runeProvider?: PositionInfo[];
  tgtStake?: PositionInfo[];
  thorchainBond?: PositionInfo[];
}

const Component: FC = () => {
  const initialState: InitialState = { loading: true };
  const [state, setState] = useState(initialState);
  const {
    loading,
    liquidityPosition,
    mayaBond,
    runeProvider,
    tgtStake,
    thorchainBond,
  } = state;
  const { currency } = useBaseContext();
  const { changeVault, vault, vaults } = useVaultContext();

  const getRuneProvider = (runePrice: number): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault?.chains.find(
        ({ name }) => name === ChainKey.THORCHAIN
      )?.address;

      const token = defTokens.find(({ chain }) => chain === ChainKey.THORCHAIN);

      if (address && token) {
        api.activePositions
          .getRuneProvider(address)
          .then(({ data }) => {
            let positionItem: PositionInfo[] = [];
            positionItem.push({
              base: {
                baseTokenAddress: `https://thorchain.net/address/${address}`,
                baseChain: ChainKey.THORCHAIN,
                baseTiker: token.ticker,
                baseTokenAmount: data.value * 1e-8,
                basePriceUsd: runePrice,
              },
            });

            setState((prevState) => ({
              ...prevState,
              runeProvider: positionItem,
            }));

            resolve();
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const getTGTStake = (tgtPrice: number): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault?.chains.find(
        ({ name }) => name === ChainKey.ETHEREUM
      )?.address;

      const token = defTokens.find(
        (chain) => chain.chain === ChainKey.ETHEREUM && chain.ticker === "TGT"
      );

      if (address && token) {
        api.activePositions
          .getTGTstake(address)
          .then(({ data }) => {
            let positionItem: PositionInfo[] = [];

            positionItem.push({
              base: {
                baseTokenAddress: `https://etherscan.io/address/${address}`,
                baseChain: ChainKey.ETHEREUM,
                baseTiker: token.ticker,
                baseTokenAmount: data.stakedAmount,
                basePriceUsd: tgtPrice,
                reward: data.reward,
              },
            });

            setState((prevState) => ({
              ...prevState,
              tgtStake: positionItem,
            }));

            resolve();
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const getThorchainBond = (runePrice: number): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault?.chains.find(
        ({ name }) => name === ChainKey.THORCHAIN
      )?.address;

      const token = defTokens.find(({ chain }) => chain === ChainKey.THORCHAIN);

      if (address && token) {
        api.activePositions
          .nodeInfo()
          .then(({ data }) => {
            const bond = sumBonds(data, address) * 1e-8;
            let positionItem: PositionInfo[] = [];

            positionItem.push({
              base: {
                baseTokenAddress: `https://thorchain.net/address/${address}`,
                baseChain: ChainKey.THORCHAIN,
                baseTiker: token.ticker,
                baseTokenAmount: bond,
                basePriceUsd: runePrice,
              },
            });

            setState((prevState) => ({
              ...prevState,
              thorchainBond: positionItem,
            }));
            resolve();
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const getMayaBond = (): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault?.chains.find(
        ({ name }) => name === ChainKey.MAYACHAIN
      )?.address;
      const token = defTokens.find(({ chain }) => chain === ChainKey.MAYACHAIN);
      let positionItem: PositionInfo[] = [];

      if (address && token) {
        positionItem.push({
          base: {
            baseTokenAddress: `www.mayascan.org/address/${address}`,
            baseChain: ChainKey.MAYACHAIN,
            baseTiker: token.ticker,
            baseTokenAmount: 0,
            basePriceUsd: 0,
          },
        });

        setState((prevState) => ({
          ...prevState,
          mayaBond: positionItem,
        }));

        resolve();
      } else {
        resolve();
      }
    });
  };

  const getLiquidityPositions = (): Promise<void> => {
    return new Promise((resolve) => {
      if (vault) {
        const address = vault.chains.map((chain) => chain.address).join(",");
        api.activePositions
          .get(address)
          .then(({ data }) => {
            let thorchain: PositionInfo[] = [];
            let maya: PositionInfo[] = [];

            data.thorchain
              .filter((item) => getTCChain(item.pool) != "")
              .forEach((item) => {
                thorchain.push({
                  base: {
                    baseTokenAddress: `https://thorchain.net/address/${
                      item.runeAddress == ""
                        ? item.assetAddress
                        : item.runeAddress
                    }`,
                    baseChain: getTCChain(item.pool),
                    baseTiker: getTiker(item.pool),
                    baseTokenAmount: item.assetAdded,
                    basePriceUsd: item.assetPriceUsd,
                  },
                  target: {
                    targetTokenAddress: `https://thorchain.net/address/${
                      item.runeAddress == ""
                        ? item.assetAddress
                        : item.runeAddress
                    }`,
                    targetChain: ChainKey.THORCHAIN,
                    targetTiker: "RUNE",
                    targetTokenAmount: item.runeAdded,
                    targetPriceUsd: item.runeOrCacaoPricePriceUsd,
                  },
                });
              });

            data.maya
              .filter((item) => getMayaChain(item.pool) != "")
              .forEach((item) => {
                maya.push({
                  base: {
                    baseTokenAddress: `https://www.mayascan.org/address/${
                      item.runeAddress != ""
                        ? item.runeAddress
                        : item.assetAddress
                    }`,
                    baseChain: getMayaChain(item.pool),
                    baseTiker: getTiker(item.pool),
                    baseTokenAmount: item.assetAdded,
                    basePriceUsd: item.assetPriceUsd,
                  },
                  target: {
                    targetTokenAddress: `https://www.mayascan.org/address/${
                      item.runeAddress != ""
                        ? item.runeAddress
                        : item.assetAddress
                    }`,
                    targetChain: ChainKey.MAYACHAIN,
                    targetTiker: "CACAO",
                    targetTokenAmount: item.runeAdded,
                    targetPriceUsd: item.runeOrCacaoPricePriceUsd,
                  },
                });
              });

            setState((prevState) => ({
              ...prevState,
              liquidityPosition: {
                thorchain: thorchain,
                maya: maya,
              },
            }));

            resolve();
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const getTCChain = (pool: string): string => {
    const chain = pool.split(".")[0];
    return TCChainKey[chain as keyof typeof TCChainKey] ?? "";
  };

  const getMayaChain = (pool: string): string => {
    const chain = pool.split(".")[0];
    return MayaChainKey[chain as keyof typeof MayaChainKey] ?? "";
  };

  const getTiker = (pool: string): string => {
    return pool.split(".")[1].split("-")[0];
  };

  const sumBonds = (data: NodeInfo[], address: string): number => {
    let sum = 0;
    data?.forEach((node) => {
      node?.bondProviders?.providers?.forEach((provider) => {
        if (provider?.bondAddress === address) {
          sum += parseInt(provider.bond);
        }
      });
    });
    return sum;
  };

  const componentDidUpdate = (): void => {
    setState(initialState);

    const runeCmcId = defTokens.find(
      ({ chain, ticker }) => chain === ChainKey.THORCHAIN && ticker === "RUNE"
    )?.cmcId;
    const tgtCmcId = defTokens.find(
      ({ chain, ticker }) => chain === ChainKey.ETHEREUM && ticker === "TGT"
    )?.cmcId;
    if (runeCmcId && tgtCmcId) {
      api.coin.values([runeCmcId, tgtCmcId], currency).then(({ data }) => {
        const runePrice =
          (data?.data &&
            data.data[runeCmcId]?.quote &&
            data.data[runeCmcId].quote[currency]?.price) ||
          0;

        const tgtPrice =
          (data?.data &&
            data.data[tgtCmcId]?.quote &&
            data.data[tgtCmcId].quote[currency]?.price) ||
          0;

        Promise.all([
          getThorchainBond(runePrice ? runePrice : 0),
          getMayaBond(),
          getLiquidityPositions(),
          getTGTStake(tgtPrice ? tgtPrice : 0),
          getRuneProvider(runePrice ? runePrice : 0),
        ]).then(() => {
          setState((prevState) => ({ ...prevState, loading: false }));
        });
      });
    } else {
      setState((prevState) => ({ ...prevState, loading: false }));
    }
  };

  useEffect(componentDidUpdate, [currency, vault]);

  return loading ? (
    <div className="layout-content">
      <VultiLoading />
    </div>
  ) : (
    <div className="layout-content positions-page">
      {vault && (
        <div className="breadcrumb">
          <VaultDropdown
            vault={vault}
            vaults={vaults}
            changeVault={changeVault}
          />
          <Tooltip title="Refresh">
            <Button type="link" onClick={() => componentDidUpdate()}>
              <Synchronize />
            </Button>
          </Tooltip>
        </div>
      )}

      <h2 className="h-title">Thorchain:</h2>

      {(liquidityPosition?.thorchain &&
        liquidityPosition.thorchain.length > 0) ||
      thorchainBond ||
      runeProvider ? (
        <>
          {liquidityPosition?.thorchain.length ? (
            <PositionItem
              title="Liquidity Position"
              data={liquidityPosition.thorchain}
            />
          ) : (
            <NoData
              title="Liquidity Position"
              text="THORChain address not found in your vault"
            />
          )}

          {runeProvider ? (
            <PositionItem title="Rune Provider" data={runeProvider} />
          ) : (
            <NoData
              title="Rune Provider"
              text="THORChain address not found in your vault"
            />
          )}

          {thorchainBond ? (
            <PositionItem title="Bond" data={thorchainBond} />
          ) : (
            <NoData
              title="Bond"
              text="THORChain address not found in your vault"
            />
          )}
        </>
      ) : (
        <NoData
          title="Liquidity Position"
          text="THORChain address not found in your vault"
        />
      )}

      <div className="line"></div>
      <h2 className="h-title">Maya:</h2>

      {(liquidityPosition?.maya && liquidityPosition.maya.length > 0) ?( //|| mayaBond ? (
        <>
          {liquidityPosition?.maya.length ? (
            <PositionItem
              data={liquidityPosition.maya}
              title="Liquidity Position"
            />
          ) : (
            <NoData
              title="Liquidity Position"
              text="Mayachain address not found in your vault"
            />
          )}

          {mayaBond ? (
            <PositionItem title="Bond" data={mayaBond} />
          ) : (
            <NoData
              title="Bond"
              text="Mayachain address not found in your vault"
            />
          )}
        </>
      ) : (
        <NoData title="Liquidity Position" text="Mayachain address not found in your vault" />
      )}

      <div className="line"></div>
      <h2 className="h-title">TGT:</h2>

      {tgtStake ? (
        <PositionItem title="Stake" data={tgtStake} />
      ) : (
        <NoData title="Stake" text="Ethereum address not found in your vault" />
      )}
    </div>
  );
};
export default Component;
