import { FC, useEffect } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context";
import { ChainProps, VaultOutletContext } from "utils/interfaces";

import { ArrowRight } from "icons";
import TokenActions from "components/token-actions";
import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

const Component: FC<ChainProps> = (chain) => {
  const { address, balance, coins, name, updated } = chain;
  const { pathname } = useLocation();
  const { currency } = useBaseContext();
  const { prepareChain, vault } = useOutletContext<VaultOutletContext>();

  const componentDidUpdate = () => {
    if (!updated) prepareChain(chain, vault);
  };

  useEffect(componentDidUpdate, [updated]);

  const coin = coins.find(({ isNative }) => isNative);

  return (
    coin && (
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
        {updated ? (
          <>
            <span className={`asset${coins.length > 1 ? " multi" : ""}`}>
              {coins.length > 1
                ? `${coins.length} assets`
                : coin.balance.toBalanceFormat()}
            </span>
            <span className="amount">{balance.toValueFormat(currency)}</span>
          </>
        ) : (
          <VultiLoading />
        )}
        <TokenActions address={address} name={name} />
        <Link
          to={`${pathname}/${name.toLowerCase()}`}
          state={true}
          className="arrow"
        >
          <ArrowRight />
        </Link>
      </div>
    )
  );
};

export default Component;
