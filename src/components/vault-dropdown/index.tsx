import { FC } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dropdown, MenuProps } from "antd";

import { VaultOutletContext } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";

import { ArrowRight } from "icons";

const Component: FC = () => {
  const { t } = useTranslation();
  const { updateVault, vault, vaults } = useOutletContext<VaultOutletContext>();

  const items: MenuProps["items"] = [
    ...vaults.map((vault) => ({
      label: vault.alias,
      key: vault.uid,
      onClick: () => updateVault({ ...vault, isActive: true }),
    })),
    {
      type: "divider",
    },
    {
      key: "1",
      label: (
        <>
          <Link to={constantPaths.default.import}>
            {t(constantKeys.ADD_NEW_VAULT)}
          </Link>
          <ArrowRight />
        </>
      ),
      className: "primary",
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      className="vault-dropdown"
      overlayClassName="vault-dropdown-overlay"
    >
      <span>{vault?.alias || ""}</span>
    </Dropdown>
  );
};

export default Component;
