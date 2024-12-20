import { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { Popconfirm, Tooltip } from "antd";

import {
  defNFTs,
  exploreNFTAsset,
  LayoutKey,
  nftCollection,
} from "utils/constants";
import { useBaseContext } from "context";
import { NFTProps, VaultOutletContext } from "utils/interfaces";
import api from "utils/api";

import { Hyperlink, UserAdd, UserCheck } from "icons";
import VultiLoading from "components/vulti-loading";

interface ComponentProps extends NFTProps {
  value?: number;
}


const Component: FC<ComponentProps> = ({ collection, identifier, value }) => {
  const { updateVault, layout, vault } = useOutletContext<VaultOutletContext>();
  const { baseValue, currency } = useBaseContext();
  const { avatarUrl, hexChainCode, publicKeyEcdsa, publicKeyEddsa, uid } =
    vault;
  const url = `${defNFTs[collection][0]}${defNFTs[collection][identifier]}`;

  const handleAvatar = () => {
    api.vault
      .avatar({
        collectionId: nftCollection[collection],
        hexChainCode,
        publicKeyEcdsa,
        publicKeyEddsa,
        itemId: identifier.toString(),
        uid,
        url,
      })
      .then(() => {
        updateVault({ ...vault, avatarUrl: url });
        updateVault({ ...vault, avatarUrl: url });
      });
  };

  return (
    <div className="nft-asset-item">
      <img key={identifier} src={url} className="image" />
      <span className="name">{`${collection} #${identifier}`}</span>
      {value ? (
        <span className="value">
          {(value * baseValue).toValueFormat(currency)}
        </span>
      ) : (
        <VultiLoading />
      )}
      {layout === LayoutKey.VAULT && (
        <Popconfirm
          title="Want to set as avatar?"
          cancelButtonProps={{ type: "link" }}
          okButtonProps={{ type: "link" }}
          onConfirm={handleAvatar}
        >
          <span className="avatar">
            {avatarUrl === url ? (
              <>
                <span>Avatar</span>
                <UserCheck />
              </>
            ) : (
              <>
                <span>Set as</span>
                <UserAdd />
              </>
            )}
          </span>
        </Popconfirm>
      )}
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
