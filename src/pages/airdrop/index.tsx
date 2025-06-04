import { FC, useEffect, useState } from "react";
import {
  useMatch,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import dayjs from "dayjs";

import { useBaseContext } from "context";
import { LayoutKey, PageKey } from "utils/constants";
import {
  getAssetsBalance,
  getCurrentSeason,
  getNFTsBalance,
  getPositionsBalance,
  getActivity,
  handleSeasonPath,
} from "utils/functions";
import { Activities, VaultOutletContext, VaultProps } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";
import api from "utils/api";

import { Info } from "icons";
import VaultDropdown from "components/vault-dropdown";
import VultiLoading from "components/vulti-loading";
import constantPaths from "routes/constant-paths";

interface InitialState {
  balance: number;
  data: VaultProps[];
  loaded: boolean;
  loading: boolean;
  pageSize: number;
  total: number;
  currentActivity?: Activities;
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
  const { balance, data, loaded, loading, pageSize, total, currentActivity } =
    state;
  const { changePage, baseValue, currency, seasonInfo } = useBaseContext();
  const { layout, vault } = useOutletContext<VaultOutletContext>();
  const { id = "0" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const match =
    useMatch(constantPaths.default.airdrop) ||
    useMatch(constantPaths.shared.airdrop) ||
    useMatch(constantPaths.vault.airdrop);

  const fetchData = (isReset?: boolean): void => {
    if ((isReset || !loading) && id) {
      setState((prevState) => ({ ...prevState, loading: true }));

      const from = !isReset && data.length ? data[data.length - 1].rank : 0;

      api
        .leaderboard({ from, limit: pageSize, season: id })
        .then(({ data }) => {
          setState((prevState) => ({
            ...prevState,
            loaded: true,
            loading: false,
            balance: data.totalBalance + data.totalLp + data.totalNft,
            data: isReset ? data.vaults : [...prevState.data, ...data.vaults],
            total: data.totalVaultCount,
            currentActivity: vault
              ? getActivity(vault, id ? parseInt(id) : 0)
              : undefined,
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

  const componentDidUpdate = (): void => {
    changePage(PageKey.AIRDROP);

    setState((prevState) => ({
      ...prevState,
      currentActivity: vault
        ? getActivity(vault, id ? parseInt(id) : 0)
        : undefined,
    }));

    if (match) {
      if (parseInt(id) < seasonInfo.length) {
        fetchData(true);
      } else {
        const currentSeason = getCurrentSeason(seasonInfo);
        const redirectPath = handleSeasonPath(
          match.pattern.path,
          currentSeason ? currentSeason.id : "0"
        );
        navigate(redirectPath);
      }
    }
  };

  useEffect(componentDidUpdate, [id, vault?.seasonStats]);

  const vaultBalance = vault
    ? (getAssetsBalance(vault) +
        getNFTsBalance(vault) +
        getPositionsBalance(vault)) *
      baseValue
    : 0;

  //TODO: check logic for all seasons
  const lastCycleBalance = vault
    ? (vault.balance + vault.nftValue + vault.lpValue) * baseValue
    : 0;

  return loaded ? (
    <div className="layout-content leaderboard-page">
      <div className="stats">
        <div className="item">
          <span className="label">
          {`${t(constantKeys.TOTAL_AIRDROP_VAULT_VALUE)} ${id}`}
          </span>
          <span className="value">
            {(balance * baseValue).toValueFormat(currency)}
          </span>
        </div>
        <div className="item">
          <span className="label">
            {`${t(constantKeys.TOTAL_REGISTERED_WALLETS) } ${id}`}
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

          {currentActivity ? (
            <>
              <div className="result">
                <div className="item point">
                  <Tooltip title={t(constantKeys.DAILY_UPDATE_POINTS)}>
                    <span className="info">
                      <Info />
                    </span>
                  </Tooltip>
                  <span className="label">{t(constantKeys.FARMED)}</span>
                  <span className="value">{`${currentActivity.points.toNumberFormat()} VULTIES`}</span>
                </div>

                <div className="item divider" />

                <div className="item rank">
                  <img src="/ranks/basic.svg" className="icon" />
                  <span className="label">
                    {layout === LayoutKey.VAULT
                      ? "YOUR POSITION"
                      : "VAULT POSITION"}
                  </span>
                  <span className="value">{`${currentActivity.rank.toNumberFormat()}`}</span>
                </div>
              </div>
            </>
          ) : null}
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
              totalPoints,
            }) => {
              let medal: string;

              const vaultNumber =
                layout !== LayoutKey.DEFAULT && rank === currentActivity?.rank
                  ? lastCycleBalance || vaultBalance
                  : getCurrentSeason(seasonInfo)?.id === id
                  ? (balance + lpValue + nftValue) * baseValue
                  : balance + lpValue + nftValue;

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
                    layout !== LayoutKey.DEFAULT &&
                    rank === currentActivity?.rank
                      ? " active"
                      : ""
                  }`}
                  key={rank}
                >
                  <img src={avatarUrl || "/avatar/1.png"} className="avatar" />
                  <div className="point">
                    <span className="rank">{`#${rank.toNumberFormat()}`}</span>
                    <span className="name">{`${alias}${
                      layout !== LayoutKey.DEFAULT &&
                      rank === currentActivity?.rank
                        ? layout === LayoutKey.VAULT
                          ? " (YOU)"
                          : " (VAULT)"
                        : ""
                    }`}</span>
                    <span className="value">{`${totalPoints.toNumberFormat()} vulties`}</span>
                  </div>
                  <div className="balance">
                    {/* <span className="date">
                      {dayjs(registeredAt * 1000).format("DD MMM, YYYY")}
                    </span> */}
                    <span className="price">
                      {getCurrentSeason(seasonInfo)?.id === id
                        ? vaultNumber.toValueFormat(currency)
                        : `${vaultNumber.toNumberFormat()} VULT`}
                    </span>
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
          ) : total > data.length && currentActivity ? (
            <div className="item divider">
              <div className="shape">
                <img src="/avatar/1.png" className="main" />
                <img src="/avatar/2.png" className="bottom" />
                <img src="/avatar/3.png" className="top" />
              </div>
              <div className="loadmore">
                <span className="numb">{`+ ${(
                  (layout !== LayoutKey.DEFAULT &&
                  currentActivity.rank > data.length
                    ? currentActivity.rank - 1
                    : total) - data.length
                ).toNumberFormat()} others`}</span>
                <span className="more" onClick={() => fetchData()}>
                  load more
                </span>
              </div>
            </div>
          ) : null}
          {layout !== LayoutKey.DEFAULT &&
            currentActivity &&
            currentActivity.rank > data.length && (
              <div className="item active">
                <img
                  src={
                    layout === LayoutKey.VAULT && vault.avatarUrl
                      ? vault.avatarUrl
                      : "/avatar/1.png"
                  }
                  className="avatar"
                />
                <div className="point">
                  <span className="rank">{`#${currentActivity.rank.toNumberFormat()}`}</span>
                  <span className="name">{`${
                    vault.showNameInLeaderboard
                      ? vault.alias
                      : vault.uid.substring(0, 10)
                  }${
                    layout === LayoutKey.VAULT ? " (YOU)" : " (VAULT)"
                  }`}</span>
                </div>
                <div className="balance">
                  <span className="date">
                    {dayjs(vault.registeredAt * 1000).format("DD MMM, YYYY")}
                  </span>
                  <span className="price">{
                    getCurrentSeason(seasonInfo)?.id !== id ?
                    `${(lastCycleBalance || vaultBalance).toNumberFormat()} VULT`:
                    (lastCycleBalance || vaultBalance).toValueFormat(currency)}</span>
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
