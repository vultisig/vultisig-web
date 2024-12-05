import { FC, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";

import { useBaseContext } from "context";
import { LayoutKey, PageKey, exploreNFT } from "utils/constants";
import { VaultOutletContext } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";

import { ArrowRight, Hyperlink } from "icons";
import AssetItem from "components/nft-asset-item";
import TokenImage from "components/token-image";

const Component: FC = () => {
  const { t } = useTranslation();
  const { chainKey } = useParams();
  const { changePage } = useBaseContext();
  const { prepareNFT, layout, vault } = useOutletContext<VaultOutletContext>();
  const navigate = useNavigate();
  const goBack = useGoBack();

  const chain = vault.chains.find(
    ({ name }) => name.toLowerCase() === chainKey
  );

  const componentDidUpdate = () => {
    if (chain && !chain.nftsUpdated) prepareNFT(chain, vault);
  };

  const componentDidMount = () => {
    if (chain) {
      changePage(
        layout === LayoutKey.VAULT
          ? PageKey.VAULT_NFT_ASSETS
          : PageKey.SHARED_NFT_ASSETS
      );
    } else {
      navigate(constantPaths.vault.nfts);
    }
  };

  useEffect(componentDidUpdate, [chain?.nftsUpdated]);
  useEffect(componentDidMount, []);

  return (
    chain && (
      <>
        <div className="layout-content nft-assets-page">
          <div className="breadcrumb">
            <span
              className="back"
              onClick={() =>
                goBack(
                  layout === LayoutKey.VAULT
                    ? constantPaths.vault.nfts
                    : constantPaths.shared.nfts
                        .replace(":alias", vault.alias.replace(/ /g, "-"))
                        .replace(":uid", vault.uid)
                )
              }
            >
              <ArrowRight />
            </span>
            <span className="name">{`${chain.name} ${t(
              constantKeys.NFTS
            )}`}</span>
          </div>
          <div className="content">
            <div className="nft">
              <TokenImage alt={chain.name} />
              <span className="name">{chain.name}</span>
              {/* <span className="amount">
                {((chain.balance ?? 0) * baseValue).toValueFormat(currency)}
              </span> */}
              <Tooltip title="Link to Address">
                <a
                  href={`${exploreNFT[chain.name]}${chain.address}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="action"
                >
                  <Hyperlink />
                </a>
              </Tooltip>
            </div>
            {chain.nfts.map(({ collection, identifier }) => (
              <AssetItem
                key={identifier}
                identifier={identifier}
                collection={collection}
              />
            ))}
          </div>
        </div>
      </>
    )
  );
};

export default Component;
