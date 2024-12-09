import { FC, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Empty, Tooltip } from "antd";

import { useBaseContext } from "context";
import { ChainKey, LayoutKey, PageKey } from "utils/constants";
import { VaultOutletContext } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";

import { Info, Synchronize } from "icons";
import NFTItem from "components/nft-item";
import TotalBalance from "components/total-balance";
import VaultDropdown from "components/vault-dropdown";

const Component: FC = () => {
  const { t } = useTranslation();
  const { changePage } = useBaseContext();
  const { updateVault, layout, vault } = useOutletContext<VaultOutletContext>();

  const componentDidMount = () => {
    changePage(
      layout === LayoutKey.VAULT ? PageKey.VAULT_NFTS : PageKey.SHARED_NFTS
    );
  };

  useEffect(componentDidMount, []);

  const filteredChains = vault.chains.filter(
    ({ name }) => name === ChainKey.ETHEREUM
  );

  return (
    <>
      <div className="layout-content nfts-page">
        {layout === LayoutKey.VAULT && (
          <>
            <div className="information">
              <Info />
              <span>{t(constantKeys.SELECT_CHAINS_TOKENS)}</span>
            </div>

            <div className="breadcrumb">
              <VaultDropdown />
              <Tooltip title="Refresh">
                <Button
                  type="link"
                  onClick={() =>
                    updateVault({
                      ...vault,
                      chains: vault.chains.map((chain) => ({
                        ...chain,
                        nftsUpdated: false,
                      })),
                      isActive: true,
                    })
                  }
                >
                  <Synchronize />
                </Button>
              </Tooltip>
            </div>
          </>
        )}
        <TotalBalance />
        {filteredChains.length ? (
          filteredChains.map(({ name, ...res }) => (
            <NFTItem key={name} {...{ ...res, name }} />
          ))
        ) : (
          <Empty description={"There is no NFT"} />
        )}
      </div>
    </>
  );
};

export default Component;
