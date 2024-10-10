import { FC, useState, useEffect } from "react";
import { Button, Tooltip } from "antd"; //Empty
import { CodeSandboxOutlined } from "@ant-design/icons";

import { useBaseContext } from "context/base";
import { useVaultContext } from "context/vault";
import { ChainKey, defTokens } from "utils/constants";
import api, { NodeInfo } from "utils/api";

import { CubeOutlined, RefreshOutlined } from "icons";
import TokenImage from "components/token-image";
import VaultDropdown from "components/vault-dropdown";
import VultiLoading from "components/vulti-loading";

interface LpTokens {
  chain: string;
  token: string;
  lpChain: string;
  lpToken: string;
  asset: string;
  amount: string;
}

interface SaverToken {
  chain: string;
  token: string;
  asset: string;
  amount: string;
}

interface Thorchain {
  liquidityPosition?: LpTokens[];
  savers?: SaverToken[];
  bonds?: SaverToken;
  address?: string;
}

interface Maya {
  liquidityPosition?: LpTokens[];
  savers?: SaverToken[];
  bonds?: LpTokens;
  address?: string;
}

interface InitialState {
  loading?: boolean;
  maya?: Maya;
  thorchain?: Thorchain;
}

const Component: FC = () => {
  const initialState: InitialState = { loading: true };
  const [state, setState] = useState(initialState);
  const { loading, maya, thorchain } = state;
  const { currency } = useBaseContext();
  const { changeVault, vault, vaults } = useVaultContext();

  const sumAllBonds = (data: NodeInfo[], address: string): number => {
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

  const getThorchainData = (): Promise<void> => {
    return new Promise((resolve) => {
      api.activePositions
        .nodeInfo()
        .then(({ data }) => {
          const address = vault?.chains.find(
            ({ name }) => name === ChainKey.THORCHAIN
          )?.address;
          const token = defTokens.find(
            ({ chain }) => chain === ChainKey.THORCHAIN
          );

          if (address && token) {
            const bond = sumAllBonds(data, address) * 1e-8;

            api.coin
              .value(token.cmcId, currency)
              .then((price) => {
                setState((prevState) => ({
                  ...prevState,
                  thorchain: {
                    bonds: {
                      chain: token.chain,
                      token: token.ticker,
                      asset: bond.toBalanceFormat(),
                      amount: (bond * price).toValueFormat(currency),
                    },
                    address: address,
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
        })
        .catch(() => {
          resolve();
        });
    });
  };

  const getMayaData = (): Promise<void> => {
    return new Promise((resolve) => {
      const address = vault?.chains.find(
        ({ name }) => name === ChainKey.MAYACHAIN
      )?.address;
      const token = defTokens.find(({ chain }) => chain === ChainKey.MAYACHAIN);

      if (address && token) {
        setState((prevState) => ({
          ...prevState,
          maya: {
            bonds: {
              chain: token.chain,
              token: token.ticker,
              lpChain: token.chain,
              lpToken: token.ticker,
              asset: (0).toBalanceFormat(),
              amount: (0).toValueFormat(currency),
            },
            address: address,
          },
        }));

        resolve();
      } else {
        resolve();
      }
    });
  };

  const componentDidUpdate = (): void => {
    setState((prevState) => ({
      ...prevState,
      thorchain: undefined,
      maya: undefined,
      loading: true,
    }));

    Promise.all([getThorchainData(), getMayaData()]).then(() => {
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
      {vault ? (
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
      ) : (
        <></>
      )}

      <h2 className="h-title">Thorchain:</h2>
      {thorchain ? (
        <>
          {thorchain.liquidityPosition && (
            <>
              <h4 className="title">Liquidity Position:</h4>
              <div className="lp">
                <div className="lp-row">
                  <div className="lp-pool">
                    <div className="type lp-item">
                      <TokenImage alt={""} />
                      <span className="name">Ethereum</span>
                      <span className="text">ETH</span>
                    </div>
                    <div className="convert lp-item">
                      <img src="/images/convert.svg" />
                    </div>
                    <div className="type lp-item">
                      <TokenImage alt={""} />
                      <span className="name">Ethereum</span>
                      <span className="text">ETH</span>
                    </div>
                  </div>
                  <div className="lp-amount">
                    <div className="lp-item">1.1</div>
                    <div className="lp-item">$65,889</div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a href="" rel="noopener noreferrer" target="_blank">
                          <CubeOutlined />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {thorchain.savers && (
            <>
              <h4 className="title">Saver:</h4>
              <div className="saver">
                <div className="lp-saver">
                  <div className="lp-pool-saver">
                    <div className="type lp-item">
                      <TokenImage alt={""} />
                      <span className="name">Ethereum</span>
                      <span className="text">ETH</span>
                    </div>
                  </div>
                  <div className="lp-amount-saver">
                    <div className="lp-item">1.1</div>
                    <div className="lp-item">$65,889</div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a href="" rel="noopener noreferrer" target="_blank">
                          <CubeOutlined />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {thorchain.bonds && (
            <>
              <h4 className="title">Bond:</h4>
              <div className="saver">
                <div className="lp-saver">
                  <div className="lp-pool-saver">
                    <div className="type lp-item">
                      <TokenImage alt={ChainKey.THORCHAIN} />
                      <span className="name">{thorchain.bonds.chain}</span>
                      <span className="text">{thorchain.bonds.token}</span>
                    </div>
                  </div>
                  <div className="lp-amount-saver">
                    <div className="lp-item">{thorchain?.bonds?.asset}</div>
                    <div className="lp-item">{thorchain.bonds.amount}</div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a
                          href={`https://thorchain.net/address/${thorchain.address}`}
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
          )}
        </>
      ) : (
        // <Empty description="No data" />
        <>
          <div className="no-data">
            <CodeSandboxOutlined />
            <p>THORChain address not found in your vault</p>
          </div>
        </>
      )}

      <div className="line"></div>

      <h2 className="h-title">Maya:</h2>
      {maya ? (
        <>
          {maya.liquidityPosition && (
            <>
              <h4 className="title">Liquidity Position:</h4>
              <div className="lp">
                <div className="lp-row">
                  <div className="lp-pool">
                    <div className="type lp-item">
                      <TokenImage alt={""} />
                      <span className="name">Ethereum</span>
                      <span className="text">ETH</span>
                    </div>
                    <div className="convert lp-item">
                      <img src="/images/convert.svg" />
                    </div>
                    <div className="type lp-item">
                      <TokenImage alt={""} />
                      <span className="name">Ethereum</span>
                      <span className="text">ETH</span>
                    </div>
                  </div>
                  <div className="lp-amount">
                    <div className="lp-item">1.1</div>
                    <div className="lp-item">$65,889</div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a href="" rel="noopener noreferrer" target="_blank">
                          <CubeOutlined />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {maya.savers && (
            <>
              <h4 className="title">Saver:</h4>
              <div className="saver">
                <div className="lp-saver">
                  <div className="lp-pool-saver">
                    <div className="type lp-item">
                      <TokenImage alt={""} />
                      <span className="name">Ethereum</span>
                      <span className="text">ETH</span>
                    </div>
                  </div>
                  <div className="lp-amount-saver">
                    <div className="lp-item">1.1</div>
                    <div className="lp-item">$65,889</div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a href="" rel="noopener noreferrer" target="_blank">
                          <CubeOutlined />
                        </a>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {maya.bonds && (
            <>
              <h4 className="title">Bond:</h4>
              <div className="saver">
                <div className="lp-saver">
                  <div className="lp-pool-saver">
                    <div className="type lp-item">
                      <TokenImage alt={ChainKey.MAYACHAIN} />
                      <span className="name">{maya.bonds.chain}</span>
                      <span className="text">{maya.bonds.token}</span>
                    </div>
                  </div>
                  <div className="lp-amount-saver">
                    <div className="lp-item">{maya.bonds.asset}</div>
                    <div className="lp-item">{maya.bonds.amount}</div>
                    <div className="lp-item link-to-address">
                      <Tooltip title="Link to Address">
                        <a
                          href={`https://www.mayascan.org/address/${maya.address}`}
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
    </div>
  );
};

export default Component;
