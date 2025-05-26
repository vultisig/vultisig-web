import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import constantModals from "modals/constant-modals";
import { ShareAltOutlined } from "@ant-design/icons";
import { Tokens, NFTs } from "icons";
import { useBaseContext } from "context";
import { defTokens, PageKey } from "utils/constants";
import { SeasonInfo, VaultOutletContext } from "utils/interfaces";

import {
  calcSwapMultiplier,
  calcReferralMultiplier,
  getCurrentSeason,
  getCurrentSeasonVulties,
} from "utils/functions";
import ShareAchievements from "modals/share-achievements";

import constantKeys from "i18n/constant-keys";

import VultiLoading from "components/vulti-loading";
import { Link, useOutletContext } from "react-router-dom";
import TokenImage from "components/token-image";

interface InitialState {
  loaded: boolean;
  loading: boolean;
  showTokens: boolean;
  currentStep: number;
  nextStep: number;
  progressToNextStep: number;
  swapMultiplier: number;
  referralMultiplier: number;
  currentSeasonInfo?: SeasonInfo;
  currentSeasonVulties: number;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    loaded: false,
    loading: false,
    showTokens: true,
    currentStep: 0,
    nextStep: 0,
    progressToNextStep: 0,
    swapMultiplier: 0,
    referralMultiplier: 0,
    currentSeasonVulties: 0,
  };
  const [state, setState] = useState(initialState);
  const {
    showTokens,
    nextStep,
    currentStep,
    progressToNextStep,
    swapMultiplier,
    referralMultiplier,
    currentSeasonInfo,
    currentSeasonVulties,
  } = state;
  const { changePage, seasonInfo, milestonesSteps } = useBaseContext();
  const { vault } = useOutletContext<VaultOutletContext>();

  const handleStep = () => {
    const currentSeasonInfo = getCurrentSeason(seasonInfo);

    if (currentSeasonInfo) {
      const swapMultiplier = calcSwapMultiplier(vault.swapVolume);
      const referralMultiplier = calcReferralMultiplier(vault.referralCount);
      const currentSeasonVulties = getCurrentSeasonVulties(vault, seasonInfo);

      // if currentSeasonVulties < first milestone, set to 0
      let currentStepObj = 0;
      let nextStepObj = currentSeasonInfo.milestones[0];

      // calculate current step and next step
      currentSeasonInfo.milestones.forEach((value, index) => {
        if (currentSeasonVulties >= value) {
          const hasNextStep = index + 1 < currentSeasonInfo.milestones.length;

          currentStepObj = hasNextStep
            ? value
            : currentSeasonInfo.milestones[index - 1];
          nextStepObj = hasNextStep
            ? currentSeasonInfo.milestones[index + 1]
            : value;
        }
      });

      // calculate progress to next step
      const progressToNextStep =
        currentSeasonVulties === 0
          ? 0
          : nextStepObj
          ? Math.min(
              Math.max(
                ((currentSeasonVulties - currentStepObj < 0
                  ? 1
                  : currentSeasonVulties - currentStepObj) /
                  (nextStepObj - currentStepObj == 0
                    ? 1
                    : nextStepObj - currentStepObj)) *
                  100,
                0
              ),
              100
            )
          : 100;

      if (currentStepObj == 0) {
        currentStepObj = 0;
        nextStepObj = currentSeasonInfo.milestones[0];
      }

      setState((prevState) => ({
        ...prevState,
        currentStep: currentStepObj,
        nextStep: nextStepObj,
        progressToNextStep: Number(progressToNextStep.toFixed(0)),
        swapMultiplier,
        referralMultiplier,
        currentSeasonVulties,
        currentSeasonInfo,
      }));
    }
  };

  const handleSwitch = (): void => {
    setState((prevState) => ({
      ...prevState,
      showTokens: !prevState.showTokens,
    }));
  };

  const componentDidMount = (): void => {
    changePage(PageKey.ACHIEVEMENTES);

    handleStep();
  };

  const getProjectedPoints = (
    startTime: string,
    endTime: string,
    currentPoints: number
  ): number => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const now = Date.now();

    if (now <= start) return 0;
    if (now >= end) return currentPoints;

    const elapsed = now - start;
    const totalDuration = end - start;

    const ratePerMs = currentPoints / elapsed;
    const projectedPoints = ratePerMs * totalDuration;

    return Math.floor(projectedPoints);
  };

  useEffect(componentDidMount, []);

  return seasonInfo ? (
    <>
      <div className="layout-content achievements-page">
        <div className="achievements-title">
          <h1 className="title">
            {t(constantKeys.VAULT_AIRDROP_ACHIEVEMENTS)}
          </h1>
          <Link
            to={`#${constantModals.SHARE_ACHIEVEMENTS}`}
            className="share-btn"
          >
            <ShareAltOutlined /> {t(constantKeys.SHARE)}
          </Link>
        </div>

        <div className="projectedVult">
          <p className="title">
            {t(constantKeys.PROJECTED_$VULT_AT_END_OF_SEASON)}
          </p>
          <span className="price">{`${getProjectedPoints(
            currentSeasonInfo?.start ? currentSeasonInfo.start : "",
            currentSeasonInfo?.end ? currentSeasonInfo.end : "",
            currentSeasonVulties
          ).toNumberFormat()} $VULT`}</span>
        </div>

        <ul className="stats">
          <li>
            <p className="title">{t(constantKeys.TOTAL_VULTIES)}</p>
            <span className="price cyan">
              {currentSeasonVulties.toNumberFormat()}
            </span>
          </li>
          <li>
            <p className="title">{t(constantKeys.SWAP_VOLUME)}</p>
            <span className="price">{vault.swapVolume.toNumberFormat()}</span>
          </li>
          <li>
            <p className="title">{t(constantKeys.SWAP_MULTIPLIER)}</p>
            <span className="price blue">{`${swapMultiplier}X`}</span>
          </li>
          <li>
            <p className="title">{t(constantKeys.REFERRAL_MULTIPLIER)}</p>
            <span className="price blue">{`${referralMultiplier}X`}</span>
          </li>
        </ul>

        <div className="milestones">
          <h3 className="title">{t(constantKeys.MILESTONES)}</h3>
          <ul className="items">
            {currentSeasonInfo?.milestones.map((step, index) => (
              <li
                className={currentSeasonVulties >= step ? "active" : ""}
                key={index}
              >
                <img className="icon" src={milestonesSteps[index]} alt="icon" />
                <p className="title">{`${step.toNumberFormat()} VULTIES`}</p>
                <div className="status">
                  <img className="award" src="/images/award.svg" />
                  {currentSeasonVulties >= step ? (
                    <span>{`+${step.toNumberFormat()} VULTIES`}</span>
                  ) : (
                    <span>{t(constantKeys.LOCKED)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="next-milestones">
          <h3 className="title">
            {t(constantKeys.PROGRESS_TO_NEXT_MILESTONE)}
          </h3>
          <div className="data">
            {nextStep ? (
              <div className="steps">
                <p>{`${currentStep.toNumberFormat()} VULTIES`}</p>
                <p>{`${nextStep.toNumberFormat()} VULTIES`}</p>
              </div>
            ) : (
              <div className="steps">
                <p>{`0 VULTIES`}</p>
                <p>{`${currentStep.toNumberFormat()} VULTIES`}</p>
              </div>
            )}
            <div className="progress">
              <div
                className="value"
                style={{ width: `${progressToNextStep}%` }}
              ></div>
            </div>
            <div className="info">
              <span>
                {nextStep
                  ? `${currentSeasonVulties.toNumberFormat()} / ${nextStep.toNumberFormat()} VULTIES (${
                      100 - progressToNextStep
                    }% ${t(constantKeys.TO_NEXT_MILESTONE)})`
                  : `${currentStep.toNumberFormat()} / ${currentStep.toNumberFormat()} VULTIES (100% )`}
              </span>
            </div>
          </div>
        </div>

        <div className="multiplier-boosts">
          <h3 className="title">{t(constantKeys.MULTIPLIER_BOOSTS)}</h3>
          <div className="data">
            <div className="switcher">
              <div
                className={`item ${showTokens ? "active" : ""}`}
                onClick={handleSwitch}
              >
                <Tokens />
                <span>Tokens</span>
              </div>
              <div
                className={`item ${!showTokens ? "active" : ""}`}
                onClick={handleSwitch}
              >
                <NFTs />
                <span>NFTs</span>
              </div>
            </div>
            {showTokens ? (
              <ul className="coins">
                {currentSeasonInfo?.tokens.map((token, index) => {
                  const decimals =
                    defTokens.find((items) => items.chain == token.chain)
                      ?.decimals || 1;
                  const minAmount = token.minAmount / Math.pow(10, decimals);

                  return (
                    <li key={index}>
                      <div className="coin">
                        <TokenImage alt={token.name} />
                        <div className="info">
                          <p className="title">{token.name}</p>
                          <p className="value">{`Min. ${minAmount.toNumberFormat()} token`}</p>
                        </div>
                      </div>
                      <div className="value">
                        <p className="boost-value">{`${token.multiplier}X`}</p>
                        <p className="multiplier">
                          {t(constantKeys.MULTIPLIER)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="nfts">
                {currentSeasonInfo?.nfts?.map((nft, index) => (
                  <li key={index}>
                    <div className="coin">
                      <img
                        className="logo"
                        src={`/images/nft-image-collections/${nft.collectionName}.png`}
                        alt="coin"
                      />
                      <div className="info">
                        <p className="title">{nft.collectionName}</p>
                      </div>
                    </div>
                    <div className="value">
                      <p className="boost-value">{`${nft.multiplier}X`}</p>
                      <p className="multiplier">{t(constantKeys.MULTIPLIER)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="boost">
          <p>{t(constantKeys.BOOST_YOUR_EAENINGS)}</p>
          <div className="plans">
            <div className="item">
              <img src="/images/refresh.svg" />
              <div className="info">
                <p className="title">{t(constantKeys.INCREASE_SWAP_VOLUME)}</p>
                <p className="desc">
                  {t(constantKeys.SWAP_MORE_TO_EARN_MORE_VULTIES)}
                </p>
              </div>
            </div>
            <div className="item">
              <img src="/images/users.svg" />
              <div className="info">
                <p className="title">{t(constantKeys.REFER_FRIENDS)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareAchievements vault={vault} />
    </>
  ) : (
    <div className="layout-content">
      <VultiLoading />
    </div>
  );
};

export default Component;
