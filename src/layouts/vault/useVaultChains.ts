import { useCallback } from "react";
import { ChainProps, VaultProps } from "utils/interfaces";
import { setStoredVaults } from "utils/storage";
import VaultProvider from "utils/vault-provider";

interface UseVaultChainsProps {
  vaults: VaultProps[];
  vault?: VaultProps;
  vaultProvider: VaultProvider;
  onVaultsUpdate: (vaults: VaultProps[]) => void;
}

export const useVaultChains = ({
  vaults,
  vaultProvider,
  onVaultsUpdate,
}: UseVaultChainsProps) => {
  const updateChain = useCallback(
    (chain: ChainProps, targetVault: VaultProps): void => {
      const updatedVaults = vaults.map((item) =>
        vaultProvider.compareVault(item, targetVault)
          ? {
              ...item,
              chains: item.chains.map((item) =>
                item.name === chain.name ? { ...item, ...chain } : item
              ),
            }
          : item
      );

      setStoredVaults(updatedVaults);
      onVaultsUpdate(updatedVaults);
    },
    [vaults, vaultProvider, onVaultsUpdate]
  );

  const updatePositions = useCallback(
    (targetVault: VaultProps): void => {
      const updatedVaults = vaults.map((item) =>
        vaultProvider.compareVault(item, targetVault)
          ? {
              ...item,
              positions: { ...item.positions, ...targetVault.positions },
            }
          : item
      );

      setStoredVaults(updatedVaults);
      onVaultsUpdate(updatedVaults);
    },
    [vaults, vaultProvider, onVaultsUpdate]
  );

  return {
    updateChain,
    updatePositions,
  };
};

