import { useTranslation } from "react-i18next";
import { Storage } from "icons";
import constantKeys from "i18n/constant-keys";

interface VaultBalanceProps {
  balance: string;
  className?: string;
}

export default function VaultBalance ({ balance, className = "balance" }:VaultBalanceProps) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <Storage className="icon" />
      <span className="text">{`${t(constantKeys.VAULT_BALANCE)}:`}</span>
      <span className="value">{balance}</span>
    </div>
  );
};
