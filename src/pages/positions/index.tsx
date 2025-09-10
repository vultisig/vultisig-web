import { FC, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Tooltip } from "antd";
import { useBaseContext } from "context";
import { LayoutKey, PageKey } from "utils/constants";
import { getPositionsBalance } from "utils/functions";
import { VaultOutletContext } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";

import { Synchronize } from "icons";
import VaultDropdown from "components/vault-dropdown";
import PositionItem from "components/position-item";

const Component: FC = () => {
  const { t } = useTranslation();
  const { changePage, baseValue, currency } = useBaseContext();
  const { layout, vault, updateVault } = useOutletContext<VaultOutletContext>();
  const {
    mayaBond,
    mayaLiquidity,
    runeProvider,
    saverPosition,
    tcyStake,
    thorBond,
    thorLiquidity,
    rujiraStake,
  } = vault.positions;

  const componentDidMount = () => {
    changePage(
      layout === LayoutKey.VAULT
        ? PageKey.VAULT_POSITIONS
        : PageKey.SHARED_POSITIONS
    );
  };

  useEffect(componentDidMount, []);

  return (
    <div className="layout-content positions-page">
      {layout === LayoutKey.VAULT && (
        <div className="breadcrumb">
          <VaultDropdown />
          <Tooltip
            title={
              vault.positionsUpdating
                ? t(constantKeys.LOADING)
                : t(constantKeys.REFRESH)
            }
          >
            <Button
              type="link"
              icon={<Synchronize />}
              onClick={() => updateVault({ ...vault, positions: {} })}
              loading={vault.positionsUpdating}
            />
          </Tooltip>
        </div>
      )}
      <div className="total-balance">
        <span className="title">{t(constantKeys.POSITIONS_BALANCE)}</span>
        <span className="value">
          {(getPositionsBalance(vault) * baseValue).toValueFormat(currency)}
        </span>
      </div>

      <div className="section">
        <span className="heading">Thorchain</span>

        <PositionItem
          data={thorLiquidity}
          text="No Liquidity Position Found"
          title="Liquidity Position"
        />

      

        <PositionItem data={thorBond} text="No Bond Found" title="Bond" />

        <PositionItem
          data={tcyStake}
          text="No TCY Stake Position Found"
          title="TCY Stake"
        />

        <PositionItem
          data={rujiraStake}
          text="No RUJIRA Stake Position Found"
          title="RUJIRA Stake"
        />

      </div>

      <div className="section">
        <h2 className="heading">Maya</h2>

        <PositionItem
          data={mayaLiquidity}
          text="No LP Position Found"
          title="Liquidity Position"
        />

        <PositionItem data={mayaBond} text="No Bond Found" title="Bond" />
      </div>
    </div>
  );
};

export default Component;
