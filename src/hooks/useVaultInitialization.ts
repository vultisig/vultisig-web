import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VaultProps } from "utils/interfaces";
import { defTokens } from "utils/constants";
import { handleSeasonPath } from "utils/functions";
import VaultProvider from "utils/vault-provider";
import api from "utils/api";
import constantPaths from "routes/constant-paths";

interface UseVaultInitializationProps {
  loadVaults: () => VaultProps[];
  setVaults: (vaults: VaultProps[]) => void;
  vaultProvider: VaultProvider;
}

export const useVaultInitialization = ({
  loadVaults,
  setVaults,
  vaultProvider,
}: UseVaultInitializationProps) => {
  const navigate = useNavigate();
  const { id = "0" } = useParams<{ id: string }>();

  useEffect(() => {
    const initializeVaults = async () => {
      const storedVaults = loadVaults();

      if (!storedVaults.length) {
        const redirectPath = handleSeasonPath(constantPaths.default.airdrop, id);
        navigate(redirectPath, { replace: true });
        return;
      }

      try {
        const vaultPromises = storedVaults.map(async (vault) => {
          try {
            const fetchedVault = await api.vault.get(vault);

            if (!fetchedVault) {
              return undefined;
            }

            if (fetchedVault.chains.length) {
              return {
                ...fetchedVault,
                chains: fetchedVault.chains.map((chain) => ({
                  ...chain,
                  nfts: [],
                })),
              };
            } else {
              // Add default tokens if vault has no chains
              const defaultTokens = defTokens.filter((coin) => coin.isDefault);
              const tokenPromises = defaultTokens.map((coin) =>
                vaultProvider.addToken(coin, fetchedVault)
              );

              const chains = await Promise.all(tokenPromises);

              fetchedVault.chains = chains.map(
                ({
                  address,
                  balance,
                  chain,
                  cmcId,
                  contractAddress,
                  decimals,
                  hexPublicKey,
                  id,
                  isNative,
                  logo,
                  ticker,
                  value,
                }) => ({
                  address,
                  balance: 0,
                  coins: [
                    {
                      balance,
                      cmcId,
                      contractAddress,
                      decimals,
                      id,
                      isNative,
                      logo,
                      ticker,
                      value,
                    },
                  ],
                  name: chain,
                  nfts: [],
                  hexPublicKey,
                })
              );

              return fetchedVault;
            }
          } catch (error) {
            console.error("Failed to fetch vault:", error);
            return undefined;
          }
        });

        const updatedVaults = await Promise.all(vaultPromises);
        const validVaults = updatedVaults.filter(
          (vault): vault is VaultProps => vault !== undefined
        );

        if (validVaults.length) {
          setVaults(validVaults);
        } else {
          navigate(constantPaths.default.airdrop, { replace: true });
        }
      } catch (error) {
        console.error("Failed to initialize vaults:", error);
        navigate(constantPaths.default.airdrop, { replace: true });
      }
    };

    initializeVaults();
  }, []);
};

