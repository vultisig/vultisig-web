import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import constantModals from "modals/constant-modals";
import { ShareAltOutlined } from "@ant-design/icons";
import { Tokens, NFTs } from "icons";
import { useBaseContext } from "context";
import { PageKey } from "utils/constants";

import VultiLoading from "components/vulti-loading";
import { Link } from "react-router-dom";

interface InitialState {
  balance: number;
  loaded: boolean;
  loading: boolean;
  pageSize: number;
  total: number;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    balance: 0,
    loaded: false,
    loading: false,
    pageSize: 24,
    total: 0,
  };
  const [state, setState] = useState(initialState);
  const { loaded, loading } = state;
  const { changePage } = useBaseContext();

  const fetchData = (): void => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: true }));
    }
    setState((prevState) => ({ ...prevState, loading: false, loaded: true }));
  };

  const componentDidMount = (): void => {
    changePage(PageKey.ACHIEVEMENTES);

    fetchData();
  };

  useEffect(componentDidMount, []);

  return loaded ? (
    <div className="layout-content achievements-page">
      <div className="achievements-title">
        <h1 className="title">$VULT Airdrop Achievements</h1>
        <Link
          to={`#${constantModals.SHARE_ACHIEVEMENTS}`}
          className="share-btn"
        >
          <ShareAltOutlined /> Share
        </Link>
      </div>

      <div className="projectedVult">
        <p className="title">Projected $VULT at end of Season</p>
        <span className="price">2,500 $VULT</span>
      </div>

      <ul className="stats">
        <li>
          <p className="title">Total vulties</p>
          <span className="price cyan">75,000</span>
        </li>
        <li>
          <p className="title">Swap Volume</p>
          <span className="price">$5,000</span>
        </li>
        <li>
          <p className="title">Swap Multiplier</p>
          <span className="price blue">1.6X</span>
        </li>
        <li>
          <p className="title">Referral Multiplier</p>
          <span className="price blue">1.5X</span>
        </li>
      </ul>

      <div className="milestones">
        <h3 className="title">Milestones</h3>
        <ul className="items">
          <li className="active">
            <img className="icon" src="/images/initiate.png" alt="icon" />
            <p className="title">50,000 VULTIES</p>
            <div className="status">
              <img className="award" src="/images/award.svg" />
              <span>+50,000 VULTIES</span>
            </div>
          </li>
          <li>
            <img className="icon" src="/images/keymaster.png" alt="icon" />
            <p className="title">100,000 VULTIES</p>
            <div className="status">
              <img className="award" src="/images/award.svg" />
              <span>Locked</span>
            </div>
          </li>
          <li>
            <img
              className="icon"
              src="/images/cipher-guardian.png"
              alt="icon"
            />
            <p className="title">500,000 VULTIES</p>
            <div className="status">
              <img className="award" src="/images/award.svg" />
              <span>Locked</span>
            </div>
          </li>
          <li>
            <img
              className="icon"
              src="/images/consensus-leader.png"
              alt="icon"
            />
            <p className="title">1000,000 VULTIES</p>
            <div className="status">
              <img className="award" src="/images/award.svg" />
              <span>Locked</span>
            </div>
          </li>
          <li>
            <img className="icon" src="/images/validator.png" alt="icon" />
            <p className="title">10,000,000 VULTIES</p>
            <div className="status">
              <img className="award" src="/images/award.svg" />
              <span>Locked</span>
            </div>
          </li>
        </ul>
      </div>

      <div className="next-milestones">
        <h3 className="title">Progress to Next Milestone</h3>
        <div className="data">
          <div className="steps">
            <p>50,000 VULTIES</p>
            <p>100,000 VULTIES</p>
          </div>
          <div className="progress">
            <div className="value" style={{ width: "45%" }}></div>
          </div>
          <div className="info">
            <span>75,000 / 100,000 VULTIES (50% to next milestone)</span>
          </div>
        </div>
      </div>

      <div className="multiplier-boosts">
        <h3 className="title">Multiplier Boosts</h3>
        <div className="data">
          <div className="switcher">
            <div className="item active">
              <Tokens />
              <span>Tokens</span>
            </div>
            <div className="item">
              <NFTs />
              <span>NFTs</span>
            </div>
          </div>
          <ul className="coins" >
            <li>
              <div className="coin">
                <img className="logo" src="/coins/btc.svg" alt="coin" />
                <div className="info">
                  <p className="title">VULT</p>
                  <p className="value">Min. 1,000 token</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/coins/btc.svg" alt="coin" />
                <div className="info">
                  <p className="title">VULT</p>
                  <p className="value">Min. 1,000 token</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/coins/btc.svg" alt="coin" />
                <div className="info">
                  <p className="title">VULT</p>
                  <p className="value">Min. 1,000 token</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/coins/btc.svg" alt="coin" />
                <div className="info">
                  <p className="title">VULT</p>
                  <p className="value">Min. 1,000 token</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/coins/btc.svg" alt="coin" />
                <div className="info">
                  <p className="title">VULT</p>
                  <p className="value">Min. 1,000 token</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/coins/btc.svg" alt="coin" />
                <div className="info">
                  <p className="title">VULT</p>
                  <p className="value">Min. 1,000 token</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
          </ul>
          <ul className="nfts" style={{ display: "none" }}>
            <li>
              <div className="coin">
                <img className="logo" src="/images/nft-sample.png" alt="coin" />
                <div className="info">
                  <p className="title">Thorguard</p>
                  <p className="value">#123</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/images/nft-sample.png" alt="coin" />
                <div className="info">
                  <p className="title">Thorguard</p>
                  <p className="value">#123</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/images/nft-sample.png" alt="coin" />
                <div className="info">
                  <p className="title">Thorguard</p>
                  <p className="value">#123</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/images/nft-sample.png" alt="coin" />
                <div className="info">
                  <p className="title">Thorguard</p>
                  <p className="value">#123</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/images/nft-sample.png" alt="coin" />
                <div className="info">
                  <p className="title">Thorguard</p>
                  <p className="value">#123</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
            <li>
              <div className="coin">
                <img className="logo" src="/images/nft-sample.png" alt="coin" />
                <div className="info">
                  <p className="title">Thorguard</p>
                  <p className="value">#123</p>
                </div>
              </div>
              <div className="value">
                <p className="boost-value">1.5X</p>
                <p className="multiplier">Multiplier</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="boost">
        <p>Boost Your Earnings</p>
        <div className="plans">
          <div className="item">
            <img src="/images/refresh.svg" />
            <div className="info">
              <p className="title">Increase Swap Volume</p>
              <p className="desc">Swap more to earn more VULTIES</p>
            </div>
          </div>
          <div className="item">
            <img src="/images/users.svg" />
            <div className="info">
              <p className="title">Refer Friends</p>
              <p className="desc">Get a x% bonus on referral earnings</p>
            </div>
          </div>
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
