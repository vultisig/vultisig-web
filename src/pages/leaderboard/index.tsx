import { FC, useEffect, useState } from "react";

import { useBaseContext } from "context/base";
import { useVaultContext } from "context/vault";
import { VaultProps } from "utils/interfaces";
import api from "utils/api";

import VaultDropdown from "components/vault-dropdown";
import VultiLoading from "components/vulti-loading";

interface InitialState {
  data: VaultProps[];
  loaded: boolean;
  loading: boolean;
  pageSize: number;
  total: number;
}

const Component: FC = () => {
  const initialState: InitialState = {
    data: [],
    loaded: false,
    loading: false,
    pageSize: 24,
    total: 0,
  };
  const [state, setState] = useState(initialState);
  const { data, loaded, loading, pageSize, total } = state;
  const { currency } = useBaseContext();
  const { changeVault, vault, vaults } = useVaultContext();

  const fetchData = (): void => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: true }));

      api
        .leaderboard({ from: data.length, limit: pageSize })
        .then(({ data }) => {
          setState((prevState) => ({
            ...prevState,
            loaded: true,
            loading: false,
            data: [...prevState.data, ...data.vaults],
            total: data.totalVaultCount,
          }));
        })
        .catch(() => {
          setState((prevState) => ({
            ...prevState,
            loaded: true,
            loading: false,
          }));
        });
    }
  };

  const componentDidMount = (): void => {
    fetchData();
  };

  useEffect(componentDidMount, []);

  return loaded && vault ? (
    <div className="layout-content leaderboard-page">
      <div className="breadcrumb">
        <VaultDropdown
          vault={vault}
          vaults={vaults}
          changeVault={changeVault}
        />

        <div className="result">
          <div className="item point">
            <span className="label">FARMED</span>
            <span className="value">{`${vault.totalPoints.toNumberFormat()} points`}</span>
          </div>

          <div className="item divider" />

          <div className="item rank">
            <img src="/ranks/basic.svg" className="icon" />
            <span className="label">YOUR POSITION</span>
            <span className="value">{`${vault.rank.toNumberFormat()} / ${total.toNumberFormat()}`}</span>
          </div>
        </div>
      </div>
      <div className="board">
        <div className="list top">
          {data
            .filter(({ rank }) => rank < 4)
            .map(({ alias, balance, rank, totalPoints }, index) => {
              let icon: string;

              switch (index) {
                case 0:
                  icon = "gold";
                  break;
                case 1:
                  icon = "silver";
                  break;
                default:
                  icon = "bronze";
                  break;
              }

              return (
                <div
                  className={`item${rank === vault.rank ? " active" : ""}`}
                  key={rank}
                >
                  <img src={`/ranks/${icon}.svg`} className="icon" />
                  <div className="point">
                    <img src="/avatar/1.png" className="avatar" />
                    <span className="name">{`${alias}${
                      rank === vault.rank ? " (YOU)" : ""
                    }`}</span>
                    <span className="value">{`${totalPoints.toNumberFormat()} points`}</span>
                  </div>
                  <div className="rank">
                    <span className="value">{`#${rank.toNumberFormat()}`}</span>
                    <span className="price">{`${balance.toValueFormat(
                      currency
                    )}`}</span>
                  </div>
                </div>
              );
            })}
        </div>
        {data.length > 3 && (
          <div className="list">
            {data
              .filter(({ rank }) => rank > 3)
              .map(({ alias, balance, rank, totalPoints }) => (
                <div
                  className={`item${rank === vault.rank ? " active" : ""}`}
                  key={rank}
                >
                  <div className="point">
                    <img src="/avatar/1.png" className="avatar" />
                    <span className="name">{`${alias}${
                      rank === vault.rank ? " (YOU)" : ""
                    }`}</span>
                    <span className="value">{`${totalPoints.toNumberFormat()} points`}</span>
                  </div>
                  <div className="rank">
                    <span className="value">{`#${rank.toNumberFormat()}`}</span>
                    <span className="price">{`${balance.toValueFormat(
                      currency
                    )}`}</span>
                  </div>
                </div>
              ))}
            {loading ? (
              <div className="item loading">
                <VultiLoading />
              </div>
            ) : total > data.length ? (
              <div className="item divider">
                <div className="shape">
                  <img src="/avatar/1.png" className="main" />
                  <img src="/avatar/2.png" className="bottom" />
                  <img src="/avatar/3.png" className="top" />
                </div>
                <div className="stats">
                  <span className="numb">{`+ ${(
                    (vault.rank > data.length ? vault.rank - 1 : total) -
                    data.length
                  ).toNumberFormat()} others`}</span>
                  <span className="more" onClick={fetchData}>
                    load more
                  </span>
                </div>
              </div>
            ) : null}
            {vault.rank > data.length && (
              <div className="item active">
                <div className="point">
                  <img src="/avatar/1.png" className="avatar" />
                  <span className="name">{`${vault.alias}" (YOU)"`}</span>
                  <span className="value">{`${vault.totalPoints.toNumberFormat()} points`}</span>
                </div>
                <div className="rank">
                  <span className="value">{`#${vault.rank.toNumberFormat()}`}</span>
                  <span className="price">{`${vault.balance.toValueFormat(
                    currency
                  )}`}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="layout-content">
      <VultiLoading />
    </div>
  );
};

export default Component;
