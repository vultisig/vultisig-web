import { FC, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Empty, Tooltip } from "antd";

import { useBaseContext } from "context";
import { LayoutKey, PageKey } from "utils/constants";
import { VaultOutletContext } from "utils/interfaces";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";

import { CirclePlus, Info, Synchronize } from "icons";
import ChainItem from "components/chain-item";
import ChooseChain from "modals/choose-chain";
import VaultDropdown from "components/vault-dropdown";

const Component: FC = () => {
  const { t } = useTranslation();
  const { changePage, baseValue, currency } = useBaseContext();
  const { updateVault, layout, vault } = useOutletContext<VaultOutletContext>();

  const componentDidMount = () => {
    changePage(
      layout === LayoutKey.VAULT ? PageKey.VAULT_ASSETS : PageKey.SHARED_CHAINS
    );
  };

  useEffect(componentDidMount, []);

  return (
    <>
      <div className="layout-content chains-page">
        {layout === LayoutKey.VAULT && (
          <>
            <div className="information">
              <Info />

              <span>
                On this page, please enable all of the assets that you would
                like to be counted for the airdrop.
              </span>
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
                        updated: false,
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
        <div className="total-balance">
          <span className="title">{t(translation.TOTAL_BALANCE)}</span>
          <span className="value">
            {(
              vault.chains.reduce(
                (acc, chain) => acc + (chain.balance ?? 0),
                0
              ) * baseValue
            ).toValueFormat(currency)}
          </span>
        </div>
        {vault.chains.length ? (
          vault.chains
            .slice()
            .sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0))
            .map(({ name, ...res }) => (
              <ChainItem key={name} {...{ ...res, name }} />
            ))
        ) : (
          <Empty
            description={
              layout === LayoutKey.VAULT
                ? "Choose a chain..."
                : "There is no chain"
            }
          />
        )}
        {layout === LayoutKey.VAULT && (
          <Link
            to={`#${constantModals.CHOOSE_CHAIN}`}
            state={true}
            className="add"
          >
            <CirclePlus /> {t(translation.CHOOSE_CHAIN)}
          </Link>
        )}
      </div>

      {layout === LayoutKey.VAULT && <ChooseChain />}
    </>
  );
};

export default Component;
