import { FC, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Empty, Tooltip } from "antd";

import { useBaseContext } from "context/base";
import { useVaultContext } from "context/vault";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";

import { PlusCircleFilled, RefreshOutlined } from "icons";
import ChainItem from "components/chain-item";
import ChooseChain from "modals/choose-chain";
import VaultDropdown from "components/vault-dropdown";
import VultiLoading from "components/vulti-loading";

const Component: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();
  const { changeVault, vault, vaults } = useVaultContext();

  const componentDidUpdate = () => {
    if (vault && !vault.updated) changeVault(vault, true);
  };

  useEffect(componentDidUpdate, [vault]);

  return vault?.updated ? (
    <>
      <div className="layout-content chains-page">
        <div className="breadcrumb">
          <VaultDropdown
            vault={vault}
            vaults={vaults}
            changeVault={(vault) => changeVault(vault, true)}
          />
          <Tooltip title="Refresh">
            <Button
              type="link"
              onClick={() => changeVault({ ...vault, updated: false }, true)}
            >
              <RefreshOutlined />
            </Button>
          </Tooltip>
        </div>
        <div className="total-balance">
          <span className="title">{t(translation.TOTAL_BALANCE)}</span>
          <span className="value">
            {vault.chains
              .reduce(
                (acc, chain) =>
                  acc +
                  chain.coins.reduce(
                    (acc, coin) => acc + coin.balance * coin.value,
                    0
                  ),
                0
              )
              .toValueFormat(currency)}
          </span>
        </div>
        {vault.chains.length ? (
          vault.chains
            .slice()
            .sort(
              (a, b) =>
                b.coins.reduce(
                  (acc, coin) => acc + coin.balance * coin.value,
                  0
                ) -
                a.coins.reduce(
                  (acc, coin) => acc + coin.balance * coin.value,
                  0
                )
            )
            .map(({ name, ...res }) => (
              <ChainItem key={name} {...{ ...res, name }} />
            ))
        ) : (
          <Empty description="Choose a chain..." />
        )}
        <Link
          to={`#${constantModals.CHOOSE_CHAIN}`}
          state={true}
          className="add"
        >
          <PlusCircleFilled /> {t(translation.CHOOSE_CHAIN)}
        </Link>
      </div>

      <ChooseChain />
    </>
  ) : (
    <div className="layout-content">
      <VultiLoading />
    </div>
  );
};

export default Component;
