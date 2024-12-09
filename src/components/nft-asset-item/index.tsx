import { FC } from "react";
import { Tooltip } from "antd";

import { defNFTs, exploreNFTAsset } from "utils/constants";
import { NFTProps } from "utils/interfaces";

import { Hyperlink } from "icons";

interface ComponentProps extends NFTProps {}

const Component: FC<ComponentProps> = ({ collection, identifier }) => {
  return (
    <div className="nft-asset-item">
      <img
        key={identifier}
        src={`${defNFTs[collection][0]}${defNFTs[collection][identifier]}`}
        className="image"
      />
      <span className="name">{`${collection} #${identifier}`}</span>
      <Tooltip title="Link to Address">
        <a
          href={`${exploreNFTAsset[collection]}${identifier}`}
          rel="noopener noreferrer"
          target="_blank"
          className="action"
        >
          <Hyperlink />
        </a>
      </Tooltip>
    </div>
  );
};

export default Component;
