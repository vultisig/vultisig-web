import { FC, useEffect } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import { Tooltip } from "antd";

import { useBaseContext } from "context";
import { defNFTs, exploreNFT } from "utils/constants";
import { ChainProps, VaultOutletContext } from "utils/interfaces";

import { ArrowRight, Hyperlink } from "icons";
import TokenImage from "components/token-image";
import VultiLoading from "components/vulti-loading";

const Component: FC<ChainProps> = (chain) => {
  const { pathname } = useLocation();
  const { address, name, nfts, nftsUpdated } = chain;
  const { currency } = useBaseContext();
  const { prepareNFT, vault } = useOutletContext<VaultOutletContext>();

  const componentDidUpdate = () => {
    if (!nftsUpdated) prepareNFT(chain, vault);
  };

  useEffect(componentDidUpdate, [nftsUpdated]);

  return (
    <div className="nft-item">
      <div className="type">
        <TokenImage alt={name} />
        {name}
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
        <span className="amount">{(0).toValueFormat(currency)}</span>
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
