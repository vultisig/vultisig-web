import { FC, useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import dayjs from "dayjs";

import { useBaseContext } from "context";
import { Currency, LayoutKey, PageKey } from "utils/constants";
import { Activities, VaultOutletContext, VaultProps } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";
import api from "utils/api";

import { Info } from "icons";
import VaultDropdown from "components/vault-dropdown";
import VultiLoading from "components/vulti-loading";
import { getActivity, getCurrentSeason } from "utils/functions";

interface InitialState {
  data: VaultProps[];
  loaded: boolean;
  loading: boolean;
  pageSize: number;
  total: number;
  totalSwapVolume: number;
  currentActivity?: Activities;
  currentSeason: number;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    data: [],
    loaded: false,
    loading: false,
    pageSize: 24,
    total: 0,
    totalSwapVolume: 0,
    currentSeason: 0,
  };
  const [state, setState] = useState(initialState);
  const {
    currentSeason,
    data,
    loaded,
    loading,
    pageSize,
    total,
    totalSwapVolume,
    currentActivity,
  } = state;
  const { changePage, baseValue, currency, seasonInfo } = useBaseContext();
  const { layout, vault } = useOutletContext<VaultOutletContext>();

  const fetchData = (): void => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: true }));

      const from = data.length ? data[data.length - 1].rank : 0;

      api
        .swap({ from, limit: pageSize })
        .then(({ data }) => {
          setState((prevState) => ({
            ...prevState,
            loaded: true,
            loading: false,
            data: [...prevState.data, ...data.vaults],
            total: data.totalVaultCount,
            totalSwapVolume: data.totalSwapVolume,
            currentSeason: parseInt(getCurrentSeason(seasonInfo)?.id || "0"),
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
    changePage(PageKey.SWAP);

    fetchData();
  };

  const componentDidUpdate = (): void => {
    if (vault) {
      const currentSeason = getCurrentSeason(seasonInfo)?.id;
      setState((prevState) => ({
        ...prevState,
        currentActivity: getActivity(
          vault,
          parseInt(currentSeason ? currentSeason : "0")
        ),
      }));
    }
  };

  useEffect(componentDidMount, []);
  useEffect(componentDidUpdate, [vault]);

  const place: { [rank: number]: string } = {
    1: "first",
    2: "second",
    3: "third",
  };

  return loaded ? (
    <div className="layout-content swap-page">
      <div className="stats">
        <div className="item">
          <span className="label">
            {`${t(constantKeys.TOTAL_AIRDROP_VAULT_VALUE)} ${currentSeason}`}
          </span>
          <span className="value">
            {totalSwapVolume.toValueFormat(currency)}
          </span>
        </div>
        <div className="item">
          <span className="label">
            {`${t(constantKeys.TOTAL_REGISTERED_WALLETS)} ${currentSeason}`}
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
              <span className="label">SWAP VOLUME</span>
              <span className="value">{`${vault.swapVolume.toNumberFormat()}`}</span>
            </div>

            <div className="item divider" />

            <div className="item rank">
              <img src="/ranks/basic.svg" className="icon" />
              <span className="label">
                {layout === LayoutKey.VAULT
                  ? "YOUR POSITION"
                  : "VAULT POSITION"}
              </span>
              <span className="value">{`${vault.swapVolumeRank.toNumberFormat()}`}</span>
            </div>
          </div>
        </div>
      )}

          <div className="winners">
            {data
              .filter((_item, index) => index < 3)
              .map(({ alias, avatarUrl, rank,  swapVolume }) => (
                <div
                  className={`item ${place[rank]}${
                    layout !== LayoutKey.DEFAULT && rank === vault.swapVolumeRank
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
                    <span className="title">
                      <span className="rank">{`#${rank.toNumberFormat()}`}</span>
                      <span className="name">{`${alias}${
                        layout !== LayoutKey.DEFAULT && rank === vault.swapVolumeRank
                          ? layout === LayoutKey.VAULT
                            ? " (YOU)"
                            : " (VAULT)"
                          : ""
                      }`}</span>
                    </span>
   
                  </div>
                  <div className="balance">
 
                    <span className="price">{`${(
                      swapVolume * baseValue
                    ).toValueFormat(currency)}`}</span>
                  </div>
                  <img
                    src={`/ranks/${place[rank]}-place.svg`}
                    className="icon"
                  />
                </div>
              ))}
          </div>


      <div className="board">
        <div className="list">
          {data
            .filter((_item, index) => index > 2)
            .map(({ alias, avatarUrl, rank, registeredAt, swapVolume }) => (
              <div key={rank} className="item">
                <div className="point">
                  <img src={avatarUrl || "/avatar/1.png"} className="avatar" />
                  <span className="title">
                    <span className="rank">{`#${rank.toNumberFormat()}`}</span>
                    <span className="name">{`${alias}${
                      layout !== LayoutKey.DEFAULT && rank === vault.swapVolumeRank
                        ? layout === LayoutKey.VAULT
                          ? " (YOU)"
                          : " (VAULT)"
                        : ""
                    }`}</span>
                  </span>
                  {/* <span className="value">{`${currentActivity?.vulties.toNumberFormat()} Vulties`}</span> */}
                </div>
                <div className="balance">
                  <span className="date">
                    {dayjs(registeredAt * 1000).format("DD MMM, YYYY")}
                  </span>
                  <span className="price">{`${(
                    swapVolume * baseValue
                  ).toValueFormat(currency)}`}</span>
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
              <div className="loadmore">
                <span className="numb">{`+ ${(
                  (layout !== LayoutKey.DEFAULT && vault.swapVolumeRank > data.length
                    ? vault.swapVolumeRank - 1
                    : total) - data.length
                ).toNumberFormat()} others`}</span>
                <span className="more" onClick={fetchData}>
                  load more
                </span>
              </div>
            </div>
          ) : null}
          
          {layout !== LayoutKey.DEFAULT && vault.swapVolumeRank > data.length && (
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
                <span className="title">
                  <span className="rank">{`#${vault.swapVolumeRank.toNumberFormat()}`}</span>
                  <span className="name">{`${
                    vault.showNameInLeaderboard
                      ? vault.alias
                      : vault.uid.substring(0, 10)
                  }${
                    layout === LayoutKey.VAULT ? " (YOU)" : " (VAULT)"
                  }`}</span>
                </span>
                <span className="value">{`${currentActivity?.points.toNumberFormat()} ${
                  Currency.USD
                }`}</span>
              </div>
              <div className="balance">
                <span className="date">
                  {dayjs(vault.registeredAt * 1000).format("DD MMM, YYYY")}
                </span>
                <span className="price">{`${vault.swapVolume.toValueFormat(
                  currency
                )}`}</span>
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
