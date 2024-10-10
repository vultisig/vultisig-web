import { FC } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dropdown, MenuProps } from "antd";

import { VaultProps } from "utils/interfaces";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import { CaretRightOutlined } from "icons";

interface ComponentProps {
  changeVault(vault: VaultProps): void;
  vault?: VaultProps;
  vaults: VaultProps[];
}

const Component: FC<ComponentProps> = ({ changeVault, vault, vaults }) => {
  const { t } = useTranslation();

  const items: MenuProps["items"] = [
    ...vaults.map((vault) => ({
      label: vault.alias,
      key: vault.uid,
      onClick: () => changeVault(vault),
    })),
    {
      type: "divider",
    },
    {
      key: "1",
      label: (
        <>
          <Link to={constantPaths.import} style={{ fontWeight: 'bold' }}>
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
          <Link to={`#${constantModals.JOIN_AIRDROP}`} state={true}  style={{ fontWeight: 'bold' }}>
            {t(translation.JOIN_AIRDROP)}
          </Link>
          <CaretRightOutlined />
        </>
      ),
      className: "primary",
    },
  ];

  return (
    <Dropdown menu={{ items }} className="vault-dropdown">
      <span>{vault?.alias ?? ""}</span>
    </Dropdown>
  );
};

export default Component;
