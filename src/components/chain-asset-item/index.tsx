import { FC } from "react";
import { useTranslation } from "react-i18next";

import { useBaseContext } from "context";
import { ChainKey } from "utils/constants";
import { isCounted } from "utils/functions";
import constantKeys from "i18n/constant-keys";

import { Check } from "icons";
import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

interface ComponentProps {
  balance: number;
  chain: ChainKey;
  logo: string;
  ticker: string;
  value: number;
}

const Component: FC<ComponentProps> = ({
  balance,
  chain,
  logo,
  ticker,
  value,
}) => {
  const { t } = useTranslation();
  const { baseValue, currency } = useBaseContext();

  return (
    <div className="chain-asset-item">
      <div className="token">
        <TokenImage alt={ticker} url={logo} />
        <span className="name">{ticker}</span>
        {isCounted(chain, ticker) && (
          <span className="counted">
            <Check />
            {t(constantKeys.COUNTED)}
          </span>
        )}
      </div>
      {isNaN(balance) ||
      isNaN(value) ||
      !value ||
      !balance ? (
        <VultiLoading />
      ) : (
        <>
          <span className="balance">{balance.toBalanceFormat()}</span>
          <span className="value">
            {(balance * value * baseValue).toValueFormat(currency)}
          </span>
        </>
      )}
    </div>
  );
};

export default Component;
