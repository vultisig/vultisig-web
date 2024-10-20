import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Empty } from "antd";

import { useBaseContext } from "context/base";
import { useSharedContext } from "context/shared";
import translation from "i18n/constant-keys";

import ChainItem from "components/chain-item";

const Component: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();
  const { vault } = useSharedContext();

  return vault ? (
    <div className="layout-content chains-page theme">
      <div className="total-balance">
        <span className="title">{t(translation.TOTAL_BALANCE)}</span>
        <span className="value">{vault.balance.toValueFormat(currency)}</span>
      </div>
      {vault.chains.length ? (
        vault.chains.map(({ name, ...res }) => (
          <ChainItem key={name} {...{ ...res, name }} />
        ))
      ) : (
        <Empty description="There is no chain" />
      )}
    </div>
  ) : (
    <></>
  );
};

export default Component;
