import { FC, useEffect } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context";
import { ChainProps, VaultOutletContext } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";

import { ArrowRight, Check } from "icons";
import TokenActions from "components/token-actions";
import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

interface ComponentProps extends ChainProps {}

const Component: FC<ComponentProps> = (chain) => {
  const { t } = useTranslation();
  const { address, balance, coins, coinsUpdated, name } = chain;
  const { pathname } = useLocation();
  const { baseValue, currency } = useBaseContext();
  const { prepareChain, vault } = useOutletContext<VaultOutletContext>();

  const componentDidUpdate = () => {
    if (!coinsUpdated) prepareChain(chain, vault);
  };

  useEffect(componentDidUpdate, [coinsUpdated]);

  const coin = coins.find(({ isNative }) => isNative);

  return (
    coin && (
      <div className="chain-item">
        <div className="type">
          <TokenImage alt={name} />
          <span className="name">{name}</span>
          <span className="text">{coin?.ticker}</span>
          <span className="counted">
            <Check /> {t(constantKeys.COUNTED)}
          </span>
        </div>
        <div className="key">
          <Truncate end={10} middle>
            {address}
          </Truncate>
        </div>
        {coinsUpdated ? (
          <>
            <span className={`asset${coins.length > 1 ? " multi" : ""}`}>
              {coins.length > 1
                ? `${coins.length} assets`
                : coin.balance.toBalanceFormat()}
            </span>
            <span className="amount">
              {(balance * baseValue).toValueFormat(currency)}
            </span>
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
