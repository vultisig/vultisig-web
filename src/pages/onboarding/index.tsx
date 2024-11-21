import { FC, useEffect } from "react";
import { Collapse, CollapseProps } from "antd";

import { useBaseContext } from "context";
import { PageKey } from "utils/constants";

const Component: FC = () => {
  const { changePage } = useBaseContext();

  const componentDidMount = () => {
    changePage(PageKey.ONBOARDING);
  };

  useEffect(componentDidMount, []);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "How do I register for the airdrop?",
      children: (
        <>
          <span>Become a Vultisig user and join the airdrop calculation.</span>
          <span>
            Note: The airdrop is based on the total amount in your vault
            multiplied by the time the assets are held in the vault. The largest
            amounts for the longest time earn the most.
          </span>
          <span>
            Read more about it <a>here</a>.
          </span>
        </>
      ),
    },
    {
      key: "2",
      label: "What assets are counted for the Airdrop?",
      children: (
        <>
          <span>
            Layer 1 assets and most tokens supported by Vultisig are counted.
            Other active assets such as LPs and Node Bonds from THORChain, MAYA
            Protocol and staked token are also valid.
          </span>
          <span>
            See the full list <a>here</a>.
          </span>
          <span>You can register as many vaults as you wish.</span>
        </>
      ),
    },
    {
      key: "3",
      label: "What is the Airdrop process?",
      children: (
        <>
          <span>
            Your assets will accumulate VULTIES over a period of 12 months. At
            the end of this period, you will receive your share of the airdrop
            (5% of $VULT).
          </span>
        </>
      ),
    },
  ];

  return (
    <div className="layout-content onboarding-page">
      <div className="steps">
        <span className="heading">
          how to participate in THE <span>$5M</span> VULTISIG AIRDROP
        </span>
        <div className="list">
          <div className="item">
            <span className="index">1</span>
            <span className="title">DOWNLOAD APP</span>
            <span className="desc">
              Start by downloading the Vultisig app from the App Store or Google
              Play to get access to the platform and airdrop.
            </span>
          </div>
          <div className="item">
            <span className="index">2</span>
            <span className="title">SETUP MULTI-FACTOR WALLET</span>
            <span className="desc">
              Create a secure wallet with multi-factor authentication to protect
              your assets and enhance your account's security.
            </span>
          </div>
          <div className="item">
            <span className="index">3</span>
            <span className="title">TRANSFER FUNDS TO VAULTS</span>
            <span className="desc">
              Deposit funds into Vultisig vaults to qualify for the airdrop and
              participate in platform activities.
            </span>
          </div>
          <div className="item">
            <span className="index">4</span>
            <span className="title">JOIN THE AIRDROP</span>
            <span className="desc">
              Join the airdrop and follow the leaderboard on AIDROP.VULTISIG.COM
            </span>
          </div>
          <div className="item">
            <span className="index">5</span>
            <span className="title">REFER FRIEND</span>
            <span className="desc">
              Refer friends with our simple Telegram Mini App and increase your
              airdrop
            </span>
          </div>
        </div>
      </div>
      <div className="faq">
        <Collapse items={items} defaultActiveKey={["1"]} />
      </div>
    </div>
  );
};

export default Component;
