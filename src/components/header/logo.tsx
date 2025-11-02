import { FC } from "react";
import { Link } from "react-router-dom";
import { LayoutKey } from "utils/constants";
import { VaultProps } from "utils/interfaces";
import { Vultisig } from "icons";

interface LogoProps {
  layout: LayoutKey;
  vault?: VaultProps;
  to: string;
  className?: string;
}

const Logo: FC<LogoProps> = ({ layout, vault, to, className = "logo" }) => {
  return (
    <Link to={to} className={className}>
      {layout === LayoutKey.SHARED ? (
        <>
          {vault?.logo ? (
            <img className="shape" src={vault.logo} alt={vault.alias} />
          ) : (
            <Vultisig className="shape" />
          )}
          <span className="name">{vault?.alias}</span>
        </>
      ) : (
        <>
          <Vultisig className="shape" />
          <span className="name">Vultisig</span>
        </>
      )}
    </Link>
  );
};

export default Logo;

