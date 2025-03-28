import { FC, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import dayjs from "dayjs";

import { useBaseContext } from "context";
import { LayoutKey, PageKey } from "utils/constants";
import {
  getAssetsBalance,
  getNFTsBalance,
  getPositionsBalance,
} from "utils/functions";
import { VaultOutletContext, VaultProps } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";
import api from "utils/api";

import { Info } from "icons";
import VaultDropdown from "components/vault-dropdown";
import VultiLoading from "components/vulti-loading";

interface InitialState {
  balance: number;
  data: VaultProps[];
  loaded: boolean;
  loading: boolean;
  pageSize: number;
  total: number;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    balance: 0,
    data: [],
    loaded: false,
    loading: false,
    pageSize: 24,
    total: 0,
  };
  const [state, setState] = useState(initialState);
  const { balance, data, loaded, loading, pageSize, total } = state;
  const { changePage, baseValue, currency } = useBaseContext();
  const { layout, vault } = useOutletContext<VaultOutletContext>();

  const fetchData = (): void => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: true }));

      const from = data.length ? data[data.length - 1].rank : 0;

      api
        .leaderboard({ from, limit: pageSize })
        .then(({ data }) => {
          setState((prevState) => ({
            ...prevState,
            loaded: true,
            loading: false,
            balance: data.totalBalance + data.totalLp + data.totalNft,
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
    changePage(PageKey.LEADERBOARD);

    fetchData();
  };

  useEffect(componentDidMount, []);

  const vaultBalance = vault
    ? (getAssetsBalance(vault) +
        getNFTsBalance(vault) +
        getPositionsBalance(vault)) *
      baseValue
    : 0;

  const lastCycleBalance = vault
    ? (vault.balance + vault.nftValue + vault.lpValue) * baseValue
    : 0;

  return loaded ? (
    <div className="layout-content leaderboard-page">
      <div className="stats">
        <div className="item">
          <span className="label">
            {t(constantKeys.TOTAL_AIRDROP_VAULT_VALUE)}
          </span>
          <span className="value">
            {(balance * baseValue).toValueFormat(currency)}
          </span>
        </div>
        <div className="item">
          <span className="label">
            {t(constantKeys.TOTAL_REGISTERED_WALLETS)}
          </span>
          <span className="value">{total.toNumberFormat()}</span>
        </div>
      </div>

      {layout !== LayoutKey.DEFAULT && (
        <div className="breadcrumb">
          {layout === LayoutKey.VAULT ? (
            <VaultDropdown />
          ) : (
            <span className="vault-dropdown">{vault.alias}</span>
          )}

          <div className="result">
            <div className="item point">
              <Tooltip title={t(constantKeys.DAILY_UPDATE_POINTS)}>
                <span className="info">
                  <Info />
                </span>
              </Tooltip>
              <span className="label">FARMED</span>
              <span className="value">{`${vault.totalPoints.toNumberFormat()} VULTIES`}</span>
            </div>

            <div className="item divider" />

            <div className="item rank">
              <img src="/ranks/basic.svg" className="icon" />
              <span className="label">
                {layout === LayoutKey.VAULT
                  ? "YOUR POSITION"
                  : "VAULT POSITION"}
              </span>
              <span className="value">{`${vault.rank.toNumberFormat()}`}</span>
            </div>
          </div>
        </div>
      )}

      <div className="board">
        <div className="list">
          {data.map(
            ({
              alias,
              avatarUrl,
              balance,
              lpValue,
              nftValue,
              rank,
              registeredAt,
              totalPoints,
            }) => {
              let medal: string;

              switch (rank) {
                case 1:
                  medal = "gold";
                  break;
                case 2:
                  medal = "silver";
                  break;
                case 3:
                  medal = "bronze";
                  break;
                default:
                  medal = "";
                  break;
              }

              return (
                <div
                  className={`item${medal ? ` top ${medal}` : ""}${
                    layout !== LayoutKey.DEFAULT && rank === vault.rank
                      ? " active"
                      : ""
                  }`}
                  key={rank}
                >
                  <div className="point">
                    <img
                      src={avatarUrl || "/avatar/1.png"}
                      className="avatar"
                    />
                    <span className="rank">{`#${rank.toNumberFormat()}`}</span>
                    <span className="name">{`${alias}${
                      layout !== LayoutKey.DEFAULT && rank === vault.rank
                        ? layout === LayoutKey.VAULT
                          ? " (YOU)"
                          : " (VAULT)"
                        : ""
                    }`}</span>
                    <span className="value">{`${totalPoints.toNumberFormat()} points`}</span>
                  </div>
                  <div className="balance">
                    <span className="date">
                      {dayjs(registeredAt * 1000).format("DD MMM, YYYY")}
                    </span>
                    <span className="price">{`${(layout !== LayoutKey.DEFAULT &&
                    rank === vault.rank
                      ? lastCycleBalance || vaultBalance
                      : (balance + lpValue + nftValue) * baseValue
                    ).toValueFormat(currency)}`}</span>
                  </div>
                  {medal && (
                    <img src={`/ranks/${medal}.svg`} className="icon" />
                  )}
                </div>
              );
            }
          )}

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
              <div className="loadmore">
                <span className="numb">{`+ ${(
                  (layout !== LayoutKey.DEFAULT && vault.rank > data.length
                    ? vault.rank - 1
                    : total) - data.length
                ).toNumberFormat()} others`}</span>
                <span className="more" onClick={fetchData}>
                  load more
                </span>
              </div>
            </div>
          ) : null}
          {layout !== LayoutKey.DEFAULT && vault.rank > data.length && (
            <div className="item active">
              <div className="point">
                <img
                  src={
                    layout === LayoutKey.VAULT && vault.avatarUrl
                      ? vault.avatarUrl
                      : "/avatar/1.png"
                  }
                  className="avatar"
                />
                <span className="rank">{`#${vault.rank.toNumberFormat()}`}</span>
                <span className="name">{`${
                  vault.showNameInLeaderboard
                    ? vault.alias
                    : vault.uid.substring(0, 10)
                }${layout === LayoutKey.VAULT ? " (YOU)" : " (VAULT)"}`}</span>
                <span className="value">{`${vault.totalPoints.toNumberFormat()} points`}</span>
              </div>
              <div className="balance">
                <span className="date">
                  {dayjs(vault.registeredAt * 1000).format("DD MMM, YYYY")}
                </span>
                <span className="price">{`${(
                  lastCycleBalance || vaultBalance
                ).toValueFormat(currency)}`}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="layout-content">
      <VultiLoading />
    </div>
  );
};

export default Component;
