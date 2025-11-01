import { FC, useCallback } from "react";
import { Outlet } from "react-router-dom";

import { LayoutKey } from "utils/constants";

import Header from "components/header";
import SplashScreen from "components/splash-screen";
import VaultModals from "components/vaultModals";

import { useVaultState } from "hooks/useVaultState";
import { useVaultChains } from "hooks/useVaultChains";
import { useTokenManagement } from "hooks/useTokenManagement";
import { useVaultPreparation } from "hooks/useVaultPreparation";
import { useVaultInitialization } from "hooks/useVaultInitialization";

const Component: FC = () => {
  const {
    vault,
    vaults,
    tokens,
    vaultProvider,
    updateVault,
    deleteVault,
    setVaults,
    setTokens,
    loadVaults,
  } = useVaultState();

  const handleVaultsUpdate = useCallback(
    (updatedVaults: typeof vaults) => {
      const activeVault = updatedVaults.find(({ isActive }) => isActive);
      if (activeVault) {
        setVaults(updatedVaults);
      }
    },
    [setVaults]
  );

  const { updateChain, updatePositions } = useVaultChains({
    vaults,
    vault,
    vaultProvider,
    onVaultsUpdate: handleVaultsUpdate,
  });

  const { toggleToken, getTokens } = useTokenManagement({
    vaults,
    vaultProvider,
    onVaultsUpdate: handleVaultsUpdate,
  });

  useVaultPreparation({
    vault,
    vaultProvider,
    onChainUpdate: updateChain,
    onPositionsUpdate: updatePositions,
    onVaultUpdate: updateVault,
  });

  useVaultInitialization({
    loadVaults,
    setVaults,
    vaultProvider,
  });
  
  const handleGetTokens = useCallback(
    async (chain: any) => {
      const fetchedTokens = await getTokens(chain);
      setTokens(fetchedTokens);
    },
    [getTokens, setTokens]
  );

  if (!vault) {
    return <SplashScreen />;
  }

  return (
    <>
      <div className="layout">
        <Header
          layout={LayoutKey.VAULT}
          vault={vault}
          updateVault={updateVault}
        />
        <Outlet
          context={{
            deleteVault,
            getTokens: handleGetTokens,
            toggleToken,
            updateVault,
            layout: LayoutKey.VAULT,
            tokens,
            vault,
            vaults,
          }}
        />
      </div>
      <VaultModals
        vault={vault}
        vaults={vaults}
        updateVault={updateVault}
        deleteVault={deleteVault}
      />
    </>
  );
};

export default Component;
