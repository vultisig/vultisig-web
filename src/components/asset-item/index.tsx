import { FC } from "react";

import { useBaseContext } from "context";

import TokenImage from "components/token-image";

interface ComponentProps {
  balance: number;
  logo: string;
  ticker: string;
  value: number;
}

const Component: FC<ComponentProps> = ({ balance, logo, ticker, value }) => {
  const { currency } = useBaseContext();

  return (
    <div className="asset-item">
      <div className="token">
        <TokenImage alt={ticker} url={logo} />
        <span className="name">{ticker}</span>
      </div>
      <span className="balance">{balance.toBalanceFormat()}</span>
      <span className="value">{(balance * value).toValueFormat(currency)}</span>
    </div>
  );
};

export default Component;
