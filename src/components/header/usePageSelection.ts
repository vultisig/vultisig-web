import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBaseContext } from "context";
import { PageKey } from "utils/constants";
import { getCurrentSeason } from "utils/functions";

export const usePageSelection = (): string => {
  const { activePage, seasonInfo } = useBaseContext();
  const { id } = useParams<{ id: string }>();

  return useMemo(() => {
    switch (activePage) {
      case PageKey.SHARED_CHAINS:
      case PageKey.SHARED_CHAIN_ASSETS:
      case PageKey.VAULT_CHAINS:
      case PageKey.VAULT_CHAIN_ASSETS:
        return "1-1";

      case PageKey.SHARED_NFTS:
      case PageKey.SHARED_NFT_ASSETS:
      case PageKey.VAULT_NFTS:
      case PageKey.VAULT_NFT_ASSETS:
        return "1-2";

      case PageKey.SHARED_POSITIONS:
      case PageKey.VAULT_POSITIONS:
        return "1-3";

      case PageKey.AIRDROP:
      case PageKey.SHARED_AIRDROP:
      case PageKey.VAULT_AIRDROP:
        return getCurrentSeason(seasonInfo)?.id === id ? "8-1" : `2-${id}`;

      case PageKey.SWAP:
      case PageKey.SHARED_SWAP:
      case PageKey.VAULT_SWAP:
        return "7";

      case PageKey.ACHIEVEMENTES:
        return "3";

      case PageKey.ONBOARDING:
        return "4";

      case PageKey.IMPORT:
      case PageKey.UPLOAD:
        return "5";

      default:
        return "";
    }
  }, [activePage, seasonInfo, id]);
};

