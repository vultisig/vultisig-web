import { FC } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Empty, Input, MenuProps, Tooltip } from "antd";

import { useBaseContext } from "context/base";
import { useVaultContext } from "context/vault";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import { CaretRightOutlined, PlusCircleFilled, RefreshOutlined } from "icons";
import ChainItem from "components/chain-item";
import ChooseChain from "modals/choose-chain";
import JoinAirdrop from "modals/join-airdrop";

const Component: FC = () => {
  const { t } = useTranslation();
  const { currency } = useBaseContext();
  const { useVault, vault, vaults } = useVaultContext();

  const items: MenuProps["items"] = [
    ...vaults.map((vault) => ({
      label: vault.alias,
      key: vault.uid,
      onClick: () => useVault(vault),
    })),
    {
      type: "divider",
    },
    {
      key: "1",
      label: (
        <>
          <Link to={constantPaths.import}>
            + {t(translation.ADD_NEW_VAULT)}
          </Link>
          <CaretRightOutlined />
        </>
      ),
      className: "primary",
    },
    {
      key: "2",
      label: (
        <>
          <Link to={`#${constantModals.JOIN_AIRDROP}`}>
            {t(translation.JOIN_AIRDROP)}
          </Link>
          <CaretRightOutlined />
        </>
      ),
      className: "primary",
    },
  ];

  return vault ? (
    <>
      <div className="layout-content chains-page">
        <div className="breadcrumb">
          <Dropdown menu={{ items }} className="menu">
            <Input value={vault.alias || ""} readOnly />
          </Dropdown>
          <Tooltip title="Refresh">
            <Button type="link" onClick={() => useVault(vault)}>
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
        <Link to={`#${constantModals.CHOOSE_CHAIN}`} className="add">
          <PlusCircleFilled /> {t(translation.CHOOSE_CHAIN)}
        </Link>
      </div>

      <ChooseChain />
      <JoinAirdrop />
    </>
  ) : (
    <></>
  );
};

export default Component;
