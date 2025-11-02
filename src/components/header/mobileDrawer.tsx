import { FC } from "react";
import { Drawer, Menu, Divider, MenuProps } from "antd";
import { LayoutKey } from "utils/constants";
import { VaultProps } from "utils/interfaces";
import Logo from "./logo";
import SeasonTimer from "./seasonTimer";
import VaultBalance from "./vaultBalance";

interface MobileDrawerProps {
  visible: boolean;
  onClose: () => void;
  layout: LayoutKey;
  vault?: VaultProps;
  logoPath: string;
  seasonEndTime: string;
  vaultBalance?: string;
  navbarMenu: MenuProps["items"];
  dropdownMenu: MenuProps["items"];
}

const MobileDrawer: FC<MobileDrawerProps> = ({
  visible,
  onClose,
  layout,
  vault,
  logoPath,
  seasonEndTime,
  vaultBalance,
  navbarMenu,
  dropdownMenu,
}) => {
  return (
    <Drawer
      footer={false}
      onClose={onClose}
      title={<Logo layout={layout} vault={vault} to={logoPath} />}
      closeIcon={false}
      open={visible}
      width={320}
      placement="left"
      className="layout-menu"
    >
      <SeasonTimer endTime={seasonEndTime} />

      {vault && vaultBalance && (
        <>
          <VaultBalance balance={vaultBalance} />
          <Divider />
        </>
      )}

      <Menu
        items={navbarMenu && navbarMenu.map((item) =>
          item?.type ? { ...item, type: "group" } : item
        )}
        selectedKeys={[]}
      />

      <Divider />

      <Menu items={dropdownMenu} selectedKeys={[]} />
    </Drawer>
  );
};

export default MobileDrawer;

