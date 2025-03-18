import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import constantModals from "modals/constant-modals";
import { ShareAltOutlined } from "@ant-design/icons";
import { Tokens, NFTs } from "icons";
import { useBaseContext } from "context";
import { PageKey } from "utils/constants";
import ShareAchievements from "modals/share-achievements";

import constantKeys from "i18n/constant-keys";

import VultiLoading from "components/vulti-loading";
import { Link } from "react-router-dom";
import content from "./index.json";

interface InitialState {
  balance: number;
  loaded: boolean;
  loading: boolean;
  pageSize: number;
  showTokens: boolean;
  total: number;
  currentStep: {
    image: string;
    minVultis: number;
  };
  nextStep: {
    image: string;
    minVultis: number;
  };
  progressToNextStep: number;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    balance: 0,
    loaded: false,
    loading: false,
    pageSize: 24,
    showTokens: true,
    total: 0,
    currentStep: {
      image: "",
      minVultis: 0,
    },
    nextStep: {
      image: "/images/initiate.png",
      minVultis: 50000,
    },
    progressToNextStep: 0,
  };
  const [state, setState] = useState(initialState);
  const {
    loaded,
    loading,
    showTokens,
    currentStep,
    nextStep,
    progressToNextStep,
  } = state;
  const { changePage } = useBaseContext();

  const milestonesSteps = [
    {
      image: "/images/initiate.png",
      minVultis: 50000,
    },
    {
      image: "/images/keymaster.png",
      minVultis: 100000,
    },
    {
      image: "/images/cipher-guardian.png",
      minVultis: 500000,
    },
    {
      image: "/images/consensus-leader.png",
      minVultis: 1000000,
    },
    {
      image: "/images/validator.png",
      minVultis: 10000000,
    },
  ];

  const handelStep = (totalVulties: number) => {
    let currentStepObj = {
      image: "",
      minVultis: 0,
    };
    let nextStepObj: { image: string; minVultis: number } | null = {
      image: "/images/initiate.png",
      minVultis: 50000,
    };

    for (let i = 0; i < milestonesSteps.length; i++) {
      if (totalVulties >= milestonesSteps[i].minVultis) {
        currentStepObj = milestonesSteps[i];
        nextStepObj = milestonesSteps[i + 1] || null;
      }
    }

    const progressToNextStep = nextStepObj
      ? Math.min(
          Math.max(
            ((totalVulties - currentStepObj.minVultis) /
              (nextStepObj.minVultis - currentStepObj.minVultis)) *
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

  const fetchData = (): void => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: true }));
    }
    setState((prevState) => ({ ...prevState, loading: false, loaded: true }));
  };

  const handelSwitch = (): void => {
    setState((prevState) => ({
      ...prevState,
      showTokens: !prevState.showTokens,
    }));
  };

  const componentDidMount = (): void => {
    changePage(PageKey.ACHIEVEMENTES);

    fetchData();
    handelStep(content.totalVulties);
  };

  useEffect(componentDidMount, []);

  return loaded ? (
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
          <span className="price">
            {`${content.AirdropAchievements.vultEndOfSesson.toNumberFormat()} $VULT`}
          </span>
        </div>

        <ul className="stats">
          <li>
            <p className="title">{t(constantKeys.TOTAL_VULTIES)}</p>
            <span className="price cyan">
              {content.totalVulties.toNumberFormat()}
            </span>
          </li>
          <li>
            <p className="title">{t(constantKeys.SWAP_VOLUME)}</p>
            <span className="price">
              {content.AirdropAchievements.swapVolum.toNumberFormat()}
            </span>
          </li>
          <li>
            <p className="title">{t(constantKeys.SWAP_MULTIPLIER)}</p>
            <span className="price blue">{`${content.AirdropAchievements.swapMultiplier}X`}</span>
          </li>
          <li>
            <p className="title">{t(constantKeys.REFERRAL_MULTIPLIER)}</p>
            <span className="price blue">{`${content.AirdropAchievements.referralMultiplier}X`}</span>
          </li>
        </ul>

        <div className="milestones">
          <h3 className="title">{t(constantKeys.MILESTONES)}</h3>
          <ul className="items">
            {milestonesSteps.map((step, index) => (
              <li
                className={
                  content.totalVulties >= step.minVultis ? "active" : ""
                }
                key={index}
              >
                <img className="icon" src={step.image} alt="icon" />
                <p className="title">{`${step.minVultis.toNumberFormat()} VULTIES`}</p>
                <div className="status">
                  <img className="award" src="/images/award.svg" />
                  {content.totalVulties >= step.minVultis ? (
                    <span>{`+${step.minVultis.toNumberFormat()} VULTIES`}</span>
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
                <p>{`${currentStep?.minVultis.toNumberFormat()} VULTIES`}</p>
                <p>{`${nextStep?.minVultis.toNumberFormat()} VULTIES`}</p>
              </div>
            ) : (
              <div className="steps">
                <p>{`1,000,000 VULTIES`}</p>
                <p>{`${currentStep?.minVultis.toNumberFormat()} VULTIES`}</p>
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
                  ? `${content.totalVulties.toNumberFormat()} / ${nextStep?.minVultis.toNumberFormat()} VULTIES (${progressToNextStep}% ${t(
                      constantKeys.TO_NEXT_MILESTONE
                    )})`
                  : `${currentStep?.minVultis.toNumberFormat()} / ${currentStep?.minVultis.toNumberFormat()} VULTIES (100% )`}
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
                {content.MultiplierBoosts.tokens.map((token, index) => (
                  <li key={index}>
                    <div className="coin">
                      <img className="logo" src={token.image} alt="coin" />
                      <div className="info">
                        <p className="title">{token.name}</p>
                        <p className="value">{`Min. ${token.minTokens.toNumberFormat()} token`}</p>
                      </div>
                    </div>
                    <div className="value">
                      <p className="boost-value">{`${token.Multiplier}X`}</p>
                      <p className="multiplier">{t(constantKeys.MULTIPLIER)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="nfts">
                {content.MultiplierBoosts.nfts.map((nft, index) => (
                  <li key={index}>
                    <div className="coin">
                      <img className="logo" src={nft.image} alt="coin" />
                      <div className="info">
                        <p className="title">{nft.name}</p>
                        <p className="value">{`#${nft.Hashtag}`}</p>
                      </div>
                    </div>
                    <div className="value">
                      <p className="boost-value">{`${nft.Multiplier}X`}</p>
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
                <p className="desc">
                  {t(constantKeys.BONUS_ON_REFERRAL_EARNINGS).replaceArgs([
                    content.Earning,
                  ])}
                </p>
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
