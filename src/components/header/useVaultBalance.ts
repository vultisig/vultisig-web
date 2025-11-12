import { useMemo } from "react";
import { VaultProps } from "utils/interfaces";
import {
  getAssetsBalance,
  getNFTsBalance,
  getPositionsBalance,
} from "utils/functions";
import { Currency } from "utils/constants";

interface UseVaultBalanceProps {
  vault?: VaultProps;
  baseValue: number;
  currency: Currency;
}

export const useVaultBalance = ({
  vault,
  baseValue,
  currency,
}: UseVaultBalanceProps) => {
  const balance = useMemo(() => {
    if (!vault) return "0";

    const totalBalance =
      (getAssetsBalance(vault) +
        getNFTsBalance(vault) +
        getPositionsBalance(vault)) *
      baseValue;

    return totalBalance.toValueFormat(currency);
  }, [vault, baseValue, currency]);

  return balance;
};

