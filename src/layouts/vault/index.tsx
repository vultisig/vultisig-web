import { Outlet } from "react-router-dom";

import { LayoutKey } from "utils/constants";
import { ChainProps } from "utils/interfaces";

import Header from "components/header";
import SplashScreen from "components/splash-screen";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";
import DeleteVault from "modals/delete-vault";
import LogoutVault from "modals/logout-vault";
import RenameVault from "modals/rename-vault";
import ReferralCode from "modals/referral-code";
import VaultSettings from "modals/vault-settings";
import ShareAchievements from "modals/share-achievements";
import SharedSettings from "modals/shared-settings";
import JoinAirDrop from "modals/join-airdrop";
import ManageAirDrop from "modals/manage-airdrop";

import { useVault as useVault } from "./useVault";
import { useVaultInitialization } from "./useVaultInitialization";
import { useVaultPreparation } from "./useVaultPreparation";
import { useTokenManagement } from "./useTokenManagement";

export default function Component() {
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
    updateChain,
    updatePositions,
    updateCoins,
  } = useVault();

  const { toggleToken, getTokens } = useTokenManagement({
    vaults,
    vaultProvider,
    onVaultsUpdate: setVaults,
    updateCoins,
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

  const handleGetTokens = async (chain: ChainProps) => {
    const fetchedTokens = await getTokens(chain);
    setTokens(fetchedTokens);
    return fetchedTokens;
  };

  return vault ? (
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
      <ChangeCurrency />
      <ChangeLanguage />
      <ManageAirDrop updateVault={updateVault} vaults={vaults} />
      <RenameVault updateVault={updateVault} vault={vault} />
      <ReferralCode updateVault={updateVault} vault={vault} />
      <DeleteVault deleteVault={deleteVault} vault={vault} />
      <LogoutVault deleteVault={deleteVault} vault={vault} />
      <JoinAirDrop vault={vault} />
      <VaultSettings vault={vault} />
      <ShareAchievements vault={vault} />
      <SharedSettings vault={vault} />
    </>
  ) : (
    <SplashScreen />
  );
}
