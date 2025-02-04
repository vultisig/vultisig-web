import { FC, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Empty, Tooltip } from "antd";

import { useBaseContext } from "context";
import { LayoutKey, PageKey } from "utils/constants";
import { getAssetsBalance } from "utils/functions";
import { VaultOutletContext } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";
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
      layout === LayoutKey.VAULT ? PageKey.VAULT_CHAINS : PageKey.SHARED_CHAINS
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
              <span>{t(constantKeys.SELECT_CHAINS_TOKENS)}</span>
            </div>

            <div className="breadcrumb">
              <VaultDropdown />
              <Tooltip
                title={
                  vault.assetsUpdating
                    ? t(constantKeys.LOADING)
                    : t(constantKeys.REFRESH)
                }
              >
                <Button
                  type="link"
                  icon={<Synchronize />}
                  onClick={() =>
                    updateVault({
                      ...vault,
                      chains: vault.chains.map((chain) => ({
                        ...chain,
                        coinsUpdated: false,
                      })),
                      isActive: true,
                    })
                  }
                  loading={vault.assetsUpdating}
                />
              </Tooltip>
            </div>
          </>
        )}
        <div className="total-balance">
          <span className="title">{t(constantKeys.ASSETS_BALANCE)}</span>
          <span className="value">
            {(getAssetsBalance(vault) * baseValue).toValueFormat(currency)}
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
            <CirclePlus /> {t(constantKeys.CHOOSE_CHAIN)}
          </Link>
        )}
      </div>

      {layout === LayoutKey.VAULT && <ChooseChain />}
    </>
  );
};

export default Component;
