import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import constantModals from "modals/constant-modals";
import { ShareAltOutlined } from "@ant-design/icons";
import { Tokens, NFTs } from "icons";
import { useBaseContext } from "context";
import { defTokens, PageKey } from "utils/constants";
import { VaultOutletContext } from "utils/interfaces";
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
  projectedVulties: number;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    loaded: false,
    loading: false,
    showTokens: true,
    projectedVulties: 0,
    currentStep: 0,
    nextStep: 0,
    progressToNextStep: 0,
  };
  const [state, setState] = useState(initialState);
  const {
    showTokens,
    projectedVulties,
    nextStep,
    currentStep,
    progressToNextStep,
  } = state;
  const { changePage, achievementsConfig } = useBaseContext();
  const { vault } = useOutletContext<VaultOutletContext>();

  const milestonesSteps = [
    "/images/initiate.png",
    "/images/keymaster.png",
    "/images/cipher-guardian.png",
    "/images/consensus-leader.png",
    "/images/validator.png",
  ];

  const handelStep = (totalVulties: number) => {
    let currentStepObj = 0;
    let nextStepObj= 0;

    if (!achievementsConfig) {
      return;
    }

    for (let i = 0; i < achievementsConfig.milestones.length; i++) {
      if (totalVulties >= achievementsConfig.milestones[i]) {
        currentStepObj = achievementsConfig.milestones[i];
        nextStepObj = achievementsConfig.milestones[i + 1] || 0;
      }
    }

    const progressToNextStep = nextStepObj
      ? Math.min(
          Math.max(
            ((totalVulties - currentStepObj) /
              (nextStepObj - currentStepObj)) *
              100,
            0
          ),
          100
        )
      : 100;

    setState((prevState) => ({
      ...prevState,
      currentStep: currentStepObj,
      nextStep: nextStepObj,
      progressToNextStep: Number(progressToNextStep.toFixed(0)),
    }));
  };

  const handelSwitch = (): void => {
    setState((prevState) => ({
      ...prevState,
      showTokens: !prevState.showTokens,
    }));
  };

  const componentDidMount = (): void => {
    changePage(PageKey.ACHIEVEMENTES);
    handelStep(vault.totalPoints);
  };

  useEffect(componentDidMount, []);

  vault.totalPoints = vault.totalPoints == 0 ? 52000 : vault.totalPoints;
  vault.swapVolume = vault.swapVolume == 0 ? 5000 : vault.totalPoints;

  return achievementsConfig ? (
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
          <span className="price">{`${projectedVulties} $VULT`}</span>
        </div>

        <ul className="stats">
          <li>
            <p className="title">{t(constantKeys.TOTAL_VULTIES)}</p>
            <span className="price cyan">
              {vault.totalPoints.toNumberFormat()}
            </span>
          </li>
          <li>
            <p className="title">{t(constantKeys.SWAP_VOLUME)}</p>
            <span className="price">{vault.swapVolume.toNumberFormat()}</span>
          </li>
          <li>
            <p className="title">{t(constantKeys.SWAP_MULTIPLIER)}</p>
            <span className="price blue">{`${achievementsConfig.swapMultiplier}X`}</span>
          </li>
          <li>
            <p className="title">{t(constantKeys.REFERRAL_MULTIPLIER)}</p>
            <span className="price blue">{`${achievementsConfig.referralMultiplier}X`}</span>
          </li>
        </ul>

        <div className="milestones">
          <h3 className="title">{t(constantKeys.MILESTONES)}</h3>
          <ul className="items">
            {achievementsConfig.milestones.map((step, index) => (
              <li
                className={vault.totalPoints >= step ? "active" : ""}
                key={index}
              >
                <img
                  className="icon"
                  src={milestonesSteps[index]}
                  alt="icon"
                />
                <p className="title">{`${step.toNumberFormat()} VULTIES`}</p>
                <div className="status">
                  <img className="award" src="/images/award.svg" />
                  {vault.totalPoints >= step ? (
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
                <p>{`1,000,000 VULTIES`}</p>
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
                  ? `${vault.totalPoints.toNumberFormat()} / ${nextStep.toNumberFormat()} VULTIES (${progressToNextStep}% ${t(
                      constantKeys.TO_NEXT_MILESTONE
                    )})`
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
                onClick={handelSwitch}
              >
                <Tokens />
                <span>Tokens</span>
              </div>
              <div
                className={`item ${!showTokens ? "active" : ""}`}
                onClick={handelSwitch}
              >
                <NFTs />
                <span>NFTs</span>
              </div>
            </div>
            {showTokens ? (
              <ul className="coins">
                {achievementsConfig.tokens.map((token, index) => {
                  const decimals =
                    defTokens.find((items) => items.chain == token.chain)
                      ?.decimals || 1;
                  const minAmount = token.minAmount / Math.pow(10, decimals);
                  console.log("minAmount", minAmount);
                  console.log("decimals", decimals);
                  return (
                    <li key={index}>
                      <div className="coin">
                        <TokenImage alt={token.chain} />
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
                {achievementsConfig.nfts?.map((nft, index) => (
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
      <ShareAchievements />
    </>
  ) : (
    <div className="layout-content">
      <VultiLoading />
    </div>
  );
};

export default Component;
