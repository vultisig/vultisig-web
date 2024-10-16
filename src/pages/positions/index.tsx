import { FC, useState, useEffect } from "react";
import { Button, Tooltip } from "antd"; //Empty
import { CodeSandboxOutlined } from "@ant-design/icons";

import { useBaseContext } from "context/base";
import { useVaultContext } from "context/vault";
import { ChainKey, defTokens, MayaChainKey, TCChainKey } from "utils/constants";
import api, { activePosition, NodeInfo } from "utils/api";

import { CubeOutlined, RefreshOutlined } from "icons";
import TokenImage from "components/token-image";
import VaultDropdown from "components/vault-dropdown";
import VultiLoading from "components/vulti-loading";

interface mayaBonds {
  chain: string;
  token: string;
  lpChain: string;
  lpToken: string;
  asset: string;
  amount: string;
  address?: string;
}

interface thorchainBonds {
  chain: string;
  token: string;
  asset: string;
  amount: string;
  address?: string;
}

interface TGT {
  stakedAmount: number;
  reward: number;
  address: string;
  price: number;
}

interface RuneProvider {
  address: string;
  price: number;
  value: number;
}

interface InitialState {
  loading?: boolean;
  liquidityPosition?: activePosition;
  mayaBond?: mayaBonds;
  thorchainBond?: thorchainBonds;
  tgtStake?: TGT;
  runeProvider?: RuneProvider;
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

  const getRuneProvider = (): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault?.chains.find(
        ({ name }) => name === ChainKey.THORCHAIN
      )?.address;
      const token = defTokens.find(({ chain }) => chain === ChainKey.THORCHAIN);

      if (address && token) {
        api.coin
          .value(token.cmcId, currency)
          .then((price) => {
            api.activePositions
              .getRuneProvider(address)
              .then(({ data }) => {
                setState((prevState) => ({
                  ...prevState,
                  runeProvider: {
                    address: address,
                    price: price,
                    value: data.value * 1e-8,
                  },
                }));

                resolve();
              })
              .catch(() => {
                resolve();
              });
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const getTGTStake = (): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault?.chains.find(
        ({ name }) => name === ChainKey.ETHEREUM
      )?.address;
      
      const token = defTokens.find(
        (chain) => chain.chain === ChainKey.ETHEREUM && chain.ticker === "TGT"
      );

      if (address && token) {
        api.coin
          .value(token.cmcId, currency)
          .then((price) => {
            api.activePositions
              .getTGTstake(address)
              .then(({ data }) => {
                setState((prevState) => ({
                  ...prevState,
                  tgtStake: {
                    stakedAmount: data.stakedAmount,
                    reward: data.reward,
                    address: address,
                    price: price || 0,
                  },
                }));

                resolve();
              })
              .catch(() => {
                resolve();
              });
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const getThorchainBond = (): Promise<void> => {
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

            api.coin
              .value(token.cmcId, currency)
              .then((price) => {
                setState((prevState) => ({
                  ...prevState,
                  thorchainBond: {
                    chain: token.chain,
                    token: token.ticker,
                    asset: bond.toBalanceFormat(),
                    amount: (bond * price).toValueFormat(currency),
                    address: address,
                  },
                }));

                resolve();
              })
              .catch(() => {
                resolve();
              });
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

      if (address && token) {
        setState((prevState) => ({
          ...prevState,
          mayaBond: {
            chain: token.chain,
            token: token.ticker,
            lpChain: token.chain,
            lpToken: token.ticker,
            asset: "0",
            amount: (0).toValueFormat(currency),
            address: address,
          },
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
            setState((prevState) => ({
              ...prevState,
              liquidityPosition: {
                thorchain: data.thorchain.filter(
                  (item) => getTCChain(item.pool) != ""
                ),
                maya: data.maya.filter((item) => getMayaChain(item.pool) != ""),
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
    setState((prevState) => ({
      ...prevState,
      liquidityPosition: undefined,
      mayaBond: undefined,
      thorchainBond: undefined,
      tgtStake: undefined,
      loading: true,
    }));

    Promise.all([
      getThorchainBond(),
      getMayaBond(),
      getLiquidityPositions(),
      getTGTStake(),
      getRuneProvider(),
    ]).then(() => {
      setState((prevState) => ({ ...prevState, loading: false }));
    });
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
              <RefreshOutlined />
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
            <>
              <h4 className="title">Liquidity Position:</h4>
              <div className="lp">
                {liquidityPosition.thorchain.map((item, index) => (
                  <>
                    <div className="lp-row" key={index}>
                      <div className="lp-pool">
                        <div className="type lp-item">
                          <TokenImage alt={getTiker(item.pool)} />
                          <span className="name">{getTCChain(item.pool)}</span>

                          <span className="text">
                            {item.assetAdded
                              ? Number(item.assetAdded).toLocaleString()
                              : 0}{" "}
                            {getTiker(item.pool)}
                          </span>
                        </div>

                        <div className="convert lp-item">
                          <img src="/images/convert.svg" />
                        </div>

                        <div className="type lp-item">
                          <TokenImage alt={ChainKey.THORCHAIN} />
                          <span className="name">THORChain</span>
                          <span className="text">
                            {item.runeAdded
                              ? Number(item.runeAdded).toLocaleString()
                              : 0}{" "}
                            Rune
                          </span>
                        </div>
                      </div>

                      <div className="lp-amount">
                        <div className="lp-item">
                          {(
                            item.assetAdded * item.assetPriceUsd +
                            item.runeAdded * item.runeOrCacaoPricePriceUsd
                          ).toValueFormat(currency)}
                        </div>
                        <div className="lp-item link-to-address">
                          <Tooltip title="Link to Address">
                            <a
                              href={`https://thorchain.net/address/${
                                item.runeAddress == ""
                                  ? item.assetAddress
                                  : item.runeAddress
                              }`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <CubeOutlined />
                            </a>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4 className="title">Liquidity Position:</h4>
              <div className="no-data">
                <CodeSandboxOutlined />
                <p>THORChain address not found in your vault</p>
              </div>
            </>
          )}

          {runeProvider ? (
            <>
              <h4 className="title">Rune Provider:</h4>
              <div className="saver">
                <div className="lp-saver">
                  <div className="lp-pool-saver">
                    <div className="type lp-item">
                      <TokenImage alt={ChainKey.THORCHAIN} />
                      <span className="name">THORChain</span>
                      <span className="text">RUNE</span>
                    </div>
                  </div>
                  <div className="lp-amount-saver">
                    <div className="lp-item">
                      {runeProvider.value
                        ? Number(runeProvider.value).toLocaleString()
                        : 0}
                    </div>
                    <div className="lp-item">
                      {(runeProvider.value
                        ? Number(runeProvider.value) * runeProvider.price
                        : 0).toValueFormat(currency)}
                    </div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a
                          href={`https://thorchain.net/address/${runeProvider.address}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <CubeOutlined />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4 className="title">Bond:</h4>
              <div className="no-data">
                <CodeSandboxOutlined />
                <p>THORChain address not found in your vault</p>
              </div>
            </>
          )}

          {thorchainBond ? (
            <>
              <h4 className="title">Bond:</h4>
              <div className="saver">
                <div className="lp-saver">
                  <div className="lp-pool-saver">
                    <div className="type lp-item">
                      <TokenImage alt={ChainKey.THORCHAIN} />
                      <span className="name">{thorchainBond.chain}</span>
                      <span className="text">{thorchainBond.token}</span>
                    </div>
                  </div>
                  <div className="lp-amount-saver">
                    <div className="lp-item">{thorchainBond.asset}</div>
                    <div className="lp-item">{thorchainBond.amount}</div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a
                          href={`https://thorchain.net/address/${thorchainBond.address}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <CubeOutlined />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4 className="title">Bond:</h4>
              <div className="no-data">
                <CodeSandboxOutlined />
                <p>THORChain address not found in your vault</p>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <h4 className="title">Liquidity Position:</h4>
          <div className="no-data">
            <CodeSandboxOutlined />
            <p>THORChain address not found in your vault</p>
          </div>
        </>
      )}

      <div className="line"></div>
      <h2 className="h-title">Maya:</h2>

      {(liquidityPosition?.maya && liquidityPosition.maya.length > 0) ||
      mayaBond ? (
        <>
          {liquidityPosition?.maya.length ? (
            <>
              <h4 className="title">Liquidity Position:</h4>
              <div className="lp">
                {liquidityPosition.maya.map((item, index) => (
                  <>
                    <div className="lp-row" key={index}>
                      <div className="lp-pool">
                        <div className="type lp-item">
                          <TokenImage alt={getTiker(item.pool)} />
                          <span className="name">
                            {getMayaChain(item.pool)}
                          </span>
                          <span className="text">
                            {item.assetAdded
                              ? Number(item.assetAdded).toLocaleString()
                              : 0}{" "}
                            {getTiker(item.pool)}
                          </span>
                        </div>

                        <div className="convert lp-item">
                          <img src="/images/convert.svg" />
                        </div>

                        <div className="type lp-item">
                          <TokenImage alt={ChainKey.MAYACHAIN} />
                          <span className="name">MayaChain</span>
                          <span className="text">
                            {" "}
                            {item.runeAdded
                              ? Number(item.runeAdded).toLocaleString()
                              : 0}{" "}
                            CACAO
                          </span>
                        </div>
                      </div>
                      <div className="lp-amount">
                        <div className="lp-item">
                          {(
                            item.assetAdded * item.assetPriceUsd +
                            item.runeAdded * item.runeOrCacaoPricePriceUsd
                          ).toValueFormat(currency)}
                        </div>
                        <div className="lp-item link-to-address">
                          <Tooltip title="Link to Address">
                            <a
                              href={`https://www.mayascan.org/address/${
                                item.runeAddress != ""
                                  ? item.runeAddress
                                  : item.assetAddress
                              }`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <CubeOutlined />
                            </a>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </>
                ))}
              </div>
            </>
          ) : (
            <>
              <h4 className="title">Liquidity Position:</h4>
              <div className="no-data">
                <CodeSandboxOutlined />
                <p>Mayachain address not found in your vault</p>
              </div>
            </>
          )}

          {mayaBond ? (
            <>
              <h4 className="title">Bond:</h4>
              <div className="saver">
                <div className="lp-saver">
                  <div className="lp-pool-saver">
                    <div className="type lp-item">
                      <TokenImage alt={ChainKey.MAYACHAIN} />
                      <span className="name">{mayaBond.chain}</span>
                      <span className="text">{mayaBond.token}</span>
                    </div>
                  </div>
                  <div className="lp-amount-saver">
                    <div className="lp-item">{mayaBond.asset}</div>
                    <div className="lp-item">{mayaBond.amount}</div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a
                          href={`https://www.mayascan.org/address/${mayaBond.address}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <CubeOutlined />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4 className="title">Bond:</h4>
              <div className="no-data">
                <CodeSandboxOutlined />
                <p>Mayachain address not found in your vault</p>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="no-data">
            <CodeSandboxOutlined />
            <p>Mayachain address not found in your vault</p>
          </div>
        </>
      )}

      <div className="line"></div>
      <h2 className="h-title">TGT:</h2>

      {tgtStake ? (
        <>
          <h4 className="title">Stake:</h4>
          <div className="saver">
            <div className="lp-saver">
              <div className="lp-pool-saver">
                <div className="type lp-item">
                  <TokenImage alt={"TGT"} />
                  <span className="name">{ChainKey.ETHEREUM}</span>
                  <span className="text">TGT</span>
                </div>
              </div>
              <div className="lp-amount-saver">
                <div className="lp-item">
                  {tgtStake.stakedAmount
                    ? Number(tgtStake.stakedAmount).toLocaleString()
                    : 0}
                </div>
                <div className="lp-item">
                  {(
                    ((tgtStake.stakedAmount
                      ? Number(tgtStake.stakedAmount)
                      : 0) +
                      (tgtStake.reward ? Number(tgtStake.reward) : 0)) *
                    tgtStake.price
                  ).toValueFormat(currency)}
                </div>
                <div className="lp-item link-to-address">
                  <Tooltip title="Link to Address">
                    <a
                      href={`https://etherscan.io/address/${tgtStake.address}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <CubeOutlined />
                    </a>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <h4 className="title">Stake:</h4>
          <div className="no-data">
            <CodeSandboxOutlined />
            <p>Ethereum address not found in your vault</p>
          </div>
        </>
      )}
    </div>
  );
};
export default Component;
