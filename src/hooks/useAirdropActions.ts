import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { VaultProps } from "utils/interfaces";
import api from "utils/api";
import constantModals from "modals/constant-modals";

interface UseAirdropActionsProps {
  vault?: VaultProps;
  updateVault?: (vault: VaultProps) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAirdropActions = ({
  vault,
  updateVault,
  loading,
  setLoading,
}: UseAirdropActionsProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleJoinAirdrop = useCallback(() => {
    if (!vault || loading) return;

    setLoading(true);

    api.airdrop
      .join(vault)
      .then(() => {
        if (updateVault) {
          updateVault({ ...vault, joinAirdrop: true });
        }

        setLoading(false);

        navigate(`${pathname}#${constantModals.JOIN_AIRDROP}`, {
          replace: true,
        });
      })
      .catch((error) => {
        console.error("Failed to join airdrop:", error);
        setLoading(false);
      });
  }, [vault, loading, updateVault, pathname, navigate, setLoading]);

  return {
    handleJoinAirdrop,
  };
};

