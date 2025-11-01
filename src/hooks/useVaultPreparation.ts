import { useCallback, useEffect } from "react";
import { VaultProps } from "utils/interfaces";
import { Currency } from "utils/constants";
import VaultProvider from "utils/vault-provider";
import PositionProvider from "utils/position-provider";

interface UseVaultPreparationProps {
  vault?: VaultProps;
  vaultProvider: VaultProvider;
  onChainUpdate: (chain: any, vault: VaultProps) => void;
  onPositionsUpdate: (vault: VaultProps) => void;
  onVaultUpdate: (vault: VaultProps) => void;
}

export const useVaultPreparation = ({
  vault,
  vaultProvider,
  onChainUpdate,
  onPositionsUpdate,
  onVaultUpdate,
}: UseVaultPreparationProps) => {
  const prepareVault = useCallback(
    async (targetVault: VaultProps): Promise<void> => {
      const updatedVault = {} as Partial<VaultProps>;
      const assetsToUpdate = targetVault.chains.filter(
        ({ coinsUpdated }) => !coinsUpdated
      );
      const nftsToUpdate = targetVault.chains.filter(
        ({ nftsUpdated }) => !nftsUpdated
      );

      // Handle asset updates
      if (assetsToUpdate.length) {
        if (!targetVault.assetsUpdating) {
          updatedVault.assetsUpdating = true;

          assetsToUpdate.forEach((chain) => {
            vaultProvider
              .prepareChain(chain, Currency.USD)
              .then((preparedChain) => onChainUpdate(preparedChain, targetVault))
              .catch((error) => {
                console.error("Failed to prepare chain:", error);
              });
          });
        }
      } else if (targetVault.assetsUpdating) {
        updatedVault.assetsUpdating = false;
      }

      // Handle NFT updates
      if (nftsToUpdate.length) {
        if (!targetVault.nftsUpdating) {
          updatedVault.nftsUpdating = true;

          nftsToUpdate.forEach((chain) => {
            vaultProvider
              .prepareNFT(chain)
              .then((preparedChain) => onChainUpdate(preparedChain, targetVault))
              .catch((error) => {
                console.error("Failed to prepare NFT:", error);
              });
          });
        }
      } else if (targetVault.nftsUpdating) {
        updatedVault.nftsUpdating = false;
      }

      // Handle position updates
      if (!targetVault.positionsUpdating) {
        if (!targetVault.positions.updated) {
          const positionProvider = new PositionProvider(targetVault);
          updatedVault.positionsUpdating = true;

          try {
            await positionProvider.getPrerequisites();

            await Promise.all([
              positionProvider
                .getLiquidityPositions()
                .then((positions) => {
                  onPositionsUpdate({ ...targetVault, positions });
                })
                .catch((error) => {
                  console.error("Failed to get liquidity positions:", error);
                }),
              positionProvider
                .getMayaBond()
                .then((positions) => {
                  onPositionsUpdate({ ...targetVault, positions });
                })
                .catch((error) => {
                  console.error("Failed to get Maya bond:", error);
                }),
              positionProvider
                .getRuneProvider()
                .then((positions) => {
                  onPositionsUpdate({ ...targetVault, positions });
                })
                .catch((error) => {
                  console.error("Failed to get Rune provider:", error);
                }),
              positionProvider
                .getSaverPositions()
                .then((positions) => {
                  onPositionsUpdate({ ...targetVault, positions });
                })
                .catch((error) => {
                  console.error("Failed to get saver positions:", error);
                }),
              positionProvider
                .getTCYStake()
                .then((positions) => {
                  onPositionsUpdate({ ...targetVault, positions });
                })
                .catch((error) => {
                  console.error("Failed to get TCY stake:", error);
                }),
              positionProvider
                .getThorBond()
                .then((positions) => {
                  onPositionsUpdate({ ...targetVault, positions });
                })
                .catch((error) => {
                  console.error("Failed to get Thor bond:", error);
                }),
              positionProvider
                .getRUJIRAStake()
                .then((positions) => {
                  onPositionsUpdate({ ...targetVault, positions });
                })
                .catch((error) => {
                  console.error("Failed to get RUJIRA stake:", error);
                }),
            ]);

            onPositionsUpdate({ ...targetVault, positions: { updated: true } });
          } catch (error) {
            console.error("Failed to get position prerequisites:", error);
          }
        }
      } else if (targetVault.positions.updated) {
        updatedVault.positionsUpdating = false;
      }

      // Update vault if there are changes
      if (Object.keys(updatedVault).length) {
        onVaultUpdate({ ...targetVault, ...updatedVault } as VaultProps);
      }
    },
    [vaultProvider, onChainUpdate, onPositionsUpdate, onVaultUpdate]
  );

  // Auto-prepare vault when it changes
  useEffect(() => {
    if (vault) {
      prepareVault(vault);
    }
  }, [vault, prepareVault]);

  return {
    prepareVault,
  };
};

