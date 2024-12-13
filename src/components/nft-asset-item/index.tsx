import { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { Popconfirm, Tooltip } from "antd";

import {
  defNFTs,
  exploreNFTAsset,
  LayoutKey,
  nftCollection,
} from "utils/constants";
import { NFTProps, VaultOutletContext } from "utils/interfaces";

import { Hyperlink, UserAdd, UserCheck } from "icons";
import api from "utils/api";

const Component: FC<NFTProps> = ({ collection, identifier }) => {
  const { updateVault, layout, vault } = useOutletContext<VaultOutletContext>();
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
