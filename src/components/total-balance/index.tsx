import { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useBaseContext } from "context";
import { VaultOutletContext } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";

const Component: FC = () => {
  const { t } = useTranslation();
  const { baseValue, currency } = useBaseContext();
  const { vault } = useOutletContext<VaultOutletContext>();

  return (
    <div className="total-balance">
      <span className="title">{t(constantKeys.TOTAL_BALANCE)}</span>
      <span className="value">
        {(
          vault.chains.reduce((acc, chain) => acc + (chain.balance || 0), 0) *
          baseValue
        ).toValueFormat(currency)}
      </span>
    </div>
  );
};

export default Component;
