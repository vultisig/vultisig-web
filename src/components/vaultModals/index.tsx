import { FC } from "react";
import { VaultProps } from "utils/interfaces";

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

interface VaultModalsProps {
  vault: VaultProps;
  vaults: VaultProps[];
  updateVault: (vault: VaultProps) => void;
  deleteVault: (vault: VaultProps) => void;
}

const VaultModals: FC<VaultModalsProps> = ({
  vault,
  vaults,
  updateVault,
  deleteVault,
}) => {
  return (
    <>
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
  );
};

export default VaultModals;

