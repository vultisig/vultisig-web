import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context/base";
import { ChainKey } from "utils/constants";
import { CoinProps } from "utils/interfaces";

import { ArrowRight } from "icons";
import TokenActions from "components/token-actions";
import TokenImage from "components/token-image";

interface ComponentProps {
  address: string;
  coins: CoinProps[];
  name: ChainKey;
}

const Component: FC<ComponentProps> = ({ address, coins, name }) => {
  const { pathname } = useLocation();
  const { currency } = useBaseContext();

  const coin = coins.find(({ isNative }) => isNative);

  return coin ? (
    <>
      <div className="chain-item">
        <div className="type">
          <TokenImage alt={name} />
          <span className="name">{name}</span>
          <span className="text">{coin?.ticker}</span>
        </div>
        <div className="key">
          <Truncate end={10} middle>
            {address}
          </Truncate>
        </div>
        <span className={`asset${coins.length > 1 ? " multi" : ""}`}>
          {coins.length > 1
            ? `${coins.length} assets`
            : coin.balance.toBalanceFormat()}
        </span>
        <span className="amount">
          {coins
            .reduce((acc, coin) => acc + coin.balance * coin.value, 0)
            .toValueFormat(currency)}
        </span>
        <TokenActions address={address} name={name} />
        <Link
          to={`${pathname}/${name.toLowerCase()}`}
          state={true}
          className="arrow"
        >
          <ArrowRight />
        </Link>
      </div>
    </>
  ) : (
    <></>
  );
};

export default Component;
