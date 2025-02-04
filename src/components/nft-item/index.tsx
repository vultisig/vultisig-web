import { FC, useEffect } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";

import { useBaseContext } from "context";
import { LayoutKey, defNFTs, exploreNFT } from "utils/constants";
import { ChainProps, VaultOutletContext } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";

import { ArrowRight, Check, Hyperlink } from "icons";
import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

const Component: FC<ChainProps> = (chain) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { address, name, nfts, nftsBalance, nftsUpdated } = chain;
  const { baseValue, currency } = useBaseContext();
  const { prepareNFT, layout, vault } = useOutletContext<VaultOutletContext>();

  const componentDidUpdate = () => {
    if (layout === LayoutKey.SHARED && !nftsUpdated) prepareNFT(chain, vault);
  };

  useEffect(componentDidUpdate, [nftsUpdated]);

  return (
    <div className="nft-item">
      <div className="token">
        <TokenImage alt={name} />
        <span className="name">{name}</span>
        <span className="counted">
          <Check />
          {t(constantKeys.COUNTED)}
        </span>
      </div>
      <div className="images">
        {nftsUpdated ? (
          <>
            {nfts.length > 3 && (
              <span className="item">{`+${nfts.length - 3}`}</span>
            )}
            {nfts
              .filter((_, ind) => ind < 3)
              .map(({ collection, identifier }) => (
                <img
                  key={identifier}
                  src={`${defNFTs[collection][0]}${defNFTs[collection][identifier]}`}
                  className="item"
                />
              ))}
          </>
        ) : (
          <VultiLoading />
        )}
      </div>
      {nftsUpdated ? (
        <span className="amount">
          {((nftsBalance ?? 0) * nfts.length * baseValue).toValueFormat(
            currency
          )}
        </span>
      ) : (
        <VultiLoading />
      )}
      <Tooltip title="Link to Address">
        <a
          href={`${exploreNFT[name]}${address}`}
          rel="noopener noreferrer"
          target="_blank"
          className="action"
        >
          <Hyperlink />
        </a>
      </Tooltip>
      <Link
        to={`${pathname}/${name.toLowerCase()}`}
        state={true}
        className="arrow"
      >
        <ArrowRight />
      </Link>
    </div>
  );
};

export default Component;
