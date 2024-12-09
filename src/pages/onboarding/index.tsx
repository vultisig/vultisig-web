import { FC, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Collapse, CollapseProps } from "antd";

import { useBaseContext } from "context";
import { PageKey } from "utils/constants";
import constantKeys from "i18n/constant-keys";

const Component: FC = () => {
  const { t } = useTranslation();
  const { changePage } = useBaseContext();

  const componentDidMount = () => {
    changePage(PageKey.ONBOARDING);
  };

  useEffect(componentDidMount, []);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: t(constantKeys.QUESTION_FIRST_ONBOARDING),
      children: (
        <>
          <span>{t(constantKeys.BECOME_VULTISIG_USER)}</span>
          <span>{t(constantKeys.AIRDROP_CALCULATION_NOTE)}</span>
          <span>
            {t(constantKeys.READ_MORE_ABOUT_IT)}{" "}
            <a>{t(constantKeys.HERE_LINK)}</a>.
          </span>
        </>
      ),
    },
    {
      key: "2",
      label: t(constantKeys.QUESTION_SECOND_ONBOARDING),
      children: (
        <>
          <span>{t(constantKeys.SUPPORTED_ASSETS_NOTE)}</span>
          <span>
            {t(constantKeys.SEE_FULL_LIST)} <a>{t(constantKeys.HERE_LINK)}</a>.
          </span>
          <span>{t(constantKeys.REGISTER_UNLIMITED_VAULTS)}</span>
        </>
      ),
    },
    {
      key: "3",
      label: t(constantKeys.QUESTION_THIRD_ONBOARDING),
      children: (
        <>
          <span>{t(constantKeys.ACCUMULATE_VULTIES_PERIOD)}</span>
        </>
      ),
    },
  ];

  return (
    <div className="layout-content onboarding-page">
      <div className="steps">
        <span
          className="heading"
          dangerouslySetInnerHTML={{ __html: t(constantKeys.TITLE_ONBOARDING) }}
        />
        <div className="list">
          <div className="item">
            <span className="index">1</span>
            <span className="title">
              {t(constantKeys.DOWNLOAD_APP_TITLE_ONBOARDING)}
            </span>
            <span className="desc">
              {t(constantKeys.DOWNLOAD_APP_DESC_ONBOARDING)}
            </span>
          </div>
          <div className="item">
            <span className="index">2</span>
            <span className="title">
              {t(constantKeys.SETUP_MULTIـONBOARDING)}
            </span>
            <span className="desc">
              {t(constantKeys.SETUP_MULTI_ONBOARDING_EXPLAIN)}
            </span>
          </div>
          <div className="item">
            <span className="index">3</span>
            <span className="title">
              {t(constantKeys.TRANSFER_FUNDS_ONBOARDING)}
            </span>
            <span className="desc">
              {t(constantKeys.TRANSFER_FUNDSـONBOARDING_EXPLAIN)}
            </span>
          </div>
          <div className="item">
            <span className="index">4</span>
            <span className="title">
              {t(constantKeys.JOIN_THE_AIRDROP_ONBOARDING)}
            </span>
            <span className="desc">
              {t(constantKeys.JOIN_THE_AIRDROP_ONBOARDING_EXPLAIN)}
            </span>
          </div>
          <div className="item">
            <span className="index">5</span>
            <span className="title">
              {t(constantKeys.REFER_FRIEND_ONBOARDING)}
            </span>
            <span className="desc">
              {t(constantKeys.REFER_FRIEND_ONBOARDING_EXPLAIN)}
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
