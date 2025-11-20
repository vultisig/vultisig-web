import { useEffect } from "react";
import { ChainProps, VaultProps } from "utils/interfaces";
import { Currency } from "utils/constants";
import VaultProvider from "utils/vault-provider";
import PositionProvider from "utils/position-provider";

interface UseVaultPreparationProps {
  vault?: VaultProps;
  vaultProvider: VaultProvider;
  onChainUpdate: (chain: ChainProps, vault: VaultProps) => void;
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
  const prepareVault = (vault: VaultProps) => {
    const updatedVault = {} as VaultProps;
    const _assets = vault.chains.filter(({ coinsUpdated }) => !coinsUpdated);
    const _nfts = vault.chains.filter(({ nftsUpdated }) => !nftsUpdated);

    if (_assets.length) {
      if (!vault.assetsUpdating) {
        updatedVault.assetsUpdating = true;

        _assets.forEach((item) => {
          vaultProvider
            .prepareChain(item, Currency.USD)
            .then((chain) => onChainUpdate(chain, vault))
            .catch((error) => {
              console.error("Failed to prepare chain:", error);
            });
        });
      }
    } else if (vault.assetsUpdating) {
      updatedVault.assetsUpdating = false;
    }

    if (_nfts.length) {
      if (!vault.nftsUpdating) {
        updatedVault.nftsUpdating = true;

        _nfts.forEach((item) => {
          vaultProvider
            .prepareNFT(item)
            .then((chain) => onChainUpdate(chain, vault))
            .catch((error) => {
              console.error("Failed to prepare NFT:", error);
            });
        });
      }
    } else if (vault.nftsUpdating) {
      updatedVault.nftsUpdating = false;
    }

    if (!vault.positionsUpdating) {
      if (!vault.positions.updated) {
        const positionProvider = new PositionProvider(vault);

        updatedVault.positionsUpdating = true;

        positionProvider.getPrerequisites().then(() => {
          Promise.all([
            positionProvider.getLiquidityPositions().then((positions) => {
              onPositionsUpdate({ ...vault, positions });
            }),
            positionProvider.getMayaBond().then((positions) => {
              onPositionsUpdate({ ...vault, positions });
            }),
            positionProvider.getRuneProvider().then((positions) => {
              onPositionsUpdate({ ...vault, positions });
            }),
            positionProvider.getSaverPositions().then((positions) => {
              onPositionsUpdate({ ...vault, positions });
            }),
            positionProvider.getTCYStake().then((positions) => {
              onPositionsUpdate({ ...vault, positions });
            }),
            positionProvider.getThorBond().then((positions) => {
              onPositionsUpdate({ ...vault, positions });
            }),
            positionProvider.getRUJIRAStake().then((positions) => {
              onPositionsUpdate({ ...vault, positions });
            }),
          ]).then(() => {
            onPositionsUpdate({ ...vault, positions: { updated: true } });
          });
        });
      }
    } else if (vault.positions.updated) {
      updatedVault.positionsUpdating = false;
    }

    if (Object.keys(updatedVault).length)
      onVaultUpdate({ ...vault, ...updatedVault });
  };

  useEffect(() => {
    if (vault) prepareVault(vault);
  }, [vault]);

  return {
    prepareVault,
  };
};
