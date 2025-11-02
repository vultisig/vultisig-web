import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Button, Dropdown, Menu } from "antd";

import { useBaseContext } from "context";
import { LayoutKey } from "utils/constants";
import { getCurrentSeason } from "utils/functions";
import { VaultProps } from "utils/interfaces";
import { getStoredVaults } from "utils/storage";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import { CircleUser, HamburgerLG } from "icons";

import { useHeaderState } from "hooks/useHeaderState";
import { useLanguageSelection } from "hooks/useLanguageSelection";
import { usePageSelection } from "hooks/usePageSelection";
import { useMenuItems } from "hooks/useMenuItems";
import { useAirdropActions } from "hooks/useAirdropActions";
import { useShareVault } from "hooks/useShareVault";
import { useVaultBalance } from "hooks/useVaultBalance";

import Logo from "./logo";
import SeasonTimer from "./seasonTimer";
import MobileDrawer from "./mobileDrawer";

interface ComponentProps {
  updateVault?: (vault: VaultProps) => void;
  layout: LayoutKey;
  vault?: VaultProps;
}

const Component: FC<ComponentProps> = ({ updateVault, layout, vault }) => {
  const { t } = useTranslation();
  const { baseValue, currency, seasonInfo } = useBaseContext();
  const goBack = useGoBack();
  const vaults = getStoredVaults();

  const { loading, setLoading, visible } = useHeaderState();
  const language = useLanguageSelection();
  const selectedKey = usePageSelection();

  const vaultBalance = useVaultBalance({ vault, baseValue, currency });

  const { handleShare, contextHolder } = useShareVault({ vault });

  const { handleJoinAirdrop } = useAirdropActions({
    vault,
    updateVault,
    loading,
    setLoading,
  });

  const { dropdownMenu, navbarMenu, handleSharePath } = useMenuItems({
    layout,
    vault,
    vaults,
    currency,
    language,
    seasonInfo,
    onShare: handleShare,
    getVaultBalance: () => vaultBalance,
  });

  const isDesktop = useMediaQuery({ query: "(min-width: 1170px)" });
  const isTablet = useMediaQuery({ query: "(min-width: 768px)" });

  const logoPath = useMemo(() => {
    if (layout === LayoutKey.SHARED) {
      return handleSharePath(constantPaths.shared.chains);
    }
    if (layout === LayoutKey.VAULT) {
      return constantPaths.vault.chains;
    }
    return constantPaths.default.airdrop;
  }, [layout, handleSharePath]);

  const seasonEndTime = getCurrentSeason(seasonInfo)?.end || "";

  return (
    <>
      <div className="layout-header">
        {isDesktop ? (
          <Dropdown menu={{ items: dropdownMenu }} className="menu">
            <Button type="link">
              {layout === LayoutKey.DEFAULT ? <HamburgerLG /> : <CircleUser />}
            </Button>
          </Dropdown>
        ) : (
          <Button href={`#${constantModals.MENU}`} type="link" className="menu">
            <HamburgerLG />
          </Button>
        )}

        {layout === LayoutKey.VAULT && !vault?.joinAirdrop && (
          <Button
            onClick={handleJoinAirdrop}
            loading={isDesktop && loading}
            className="airdrop"
          >
            {t(constantKeys.JOIN_AIRDROP)}
          </Button>
        )}

        <Logo layout={layout} vault={vault} to={logoPath} />

        {isDesktop && (
          <Menu
            items={navbarMenu}
            selectedKeys={selectedKey ? [selectedKey] : []}
            mode="horizontal"
            rootClassName="layout-header-menu"
          />
        )}

        {isTablet && vault && <SeasonTimer endTime={seasonEndTime} />}
      </div>

      {!isDesktop && (
        <MobileDrawer
          visible={visible}
          onClose={goBack}
          layout={layout}
          vault={vault}
          logoPath={logoPath}
          seasonEndTime={seasonEndTime}
          vaultBalance={vault ? vaultBalance : undefined}
          navbarMenu={navbarMenu}
          dropdownMenu={dropdownMenu}
        />
      )}

      {contextHolder}
    </>
  );
};

export default Component;
