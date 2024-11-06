import { FC } from "react";

import { useBaseContext } from "context";

import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

interface ComponentProps {
  balance: number;
  logo: string;
  ticker: string;
  value: number;
}

const Component: FC<ComponentProps> = ({ balance, logo, ticker, value }) => {
  const { baseValue, currency } = useBaseContext();

  return (
    <div className="asset-item">
      <div className="token">
        <TokenImage alt={ticker} url={logo} />
        <span className="name">{ticker}</span>
      </div>
      {isNaN(balance) && isNaN(value) ? (
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
