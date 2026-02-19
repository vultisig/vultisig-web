import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  VaultProps,
  TokenProps,
  ChainProps,
  CoinParams,
  CoinProps,
} from "utils/interfaces";
import { defTokens } from "utils/constants";
import {
  getStoredVaults,
  setStoredVaults,
  getStoredAddresses,
  setStoredAddresses,
} from "utils/storage";
import VaultProvider from "utils/vault-provider";
import constantPaths from "routes/constant-paths";

interface VaultState {
  tokens: TokenProps[];
  vaults: VaultProps[];
  vault?: VaultProps;
}

export const useVault = () => {
  const [state, setState] = useState<VaultState>({
    tokens: defTokens,
    vaults: [],
  });

  const navigate = useNavigate();

  const vaultProvider = useMemo(() => new VaultProvider(), []);

  const { tokens, vault, vaults } = state;

  const updateVault = (updatedVault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        vaultProvider.compareVault(item, updatedVault)
          ? updatedVault
          : {
              ...item,
              isActive: updatedVault.isActive ? false : item.isActive,
            }
      );

      setStoredVaults(vaults);

      return {
        ...prevState,
        vault: vaults.find(({ isActive }) => isActive),
        vaults,
      };
    });
  };

  const deleteVault = (vaultToDelete: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.filter(
        ({ uid }) => uid !== vaultToDelete.uid
      );
      const addresses = getStoredAddresses();

      delete addresses[vaultToDelete.publicKeyEcdsa];
      delete addresses[vaultToDelete.publicKeyEddsa];

      setStoredAddresses(addresses);

      if (vaults.length) {
        const activeVault = vaults.find(({ isActive }) => isActive);

        if (activeVault) {
          setStoredVaults(vaults);
          return { ...prevState, vault: activeVault, vaults };
        } else {
          const modifiedVaults = vaults.map((vault, index) => ({
            ...vault,
            isActive: !index,
          }));
          const [firstVault] = modifiedVaults;

          setStoredVaults(modifiedVaults);
          return { ...prevState, vault: firstVault, vaults: modifiedVaults };
        }
      } else {
        setStoredVaults([]);
        navigate(constantPaths.default.airdrop, { replace: true });
        return { ...prevState, vault: undefined, vaults: [] };
      }
    });
  };

  const setVaults = (vaults: VaultProps[]): void => {
    const activeVault = vaults.find(({ isActive }) => isActive);

    if (activeVault) {
      setState((prevState) => ({ ...prevState, vault: activeVault, vaults }));
      setStoredVaults(vaults);
    } else if (vaults.length) {
      const modifiedVaults = vaults.map((vault, index) => ({
        ...vault,
        isActive: !index,
      }));
      const [firstVault] = modifiedVaults;

      setState((prevState) => ({
        ...prevState,
        vault: firstVault,
        vaults: modifiedVaults,
      }));
      setStoredVaults(modifiedVaults);
    } else {
      setState((prevState) => ({ ...prevState, vault: undefined, vaults: [] }));
      setStoredVaults([]);
    }
  };

  const updateChain = (chain: ChainProps, vault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        vaultProvider.compareVault(item, vault)
          ? {
              ...item,
              chains: item.chains.map((item) =>
                item.name === chain.name ? { ...item, ...chain } : item
              ),
            }
          : item
      );

      setStoredVaults(vaults);

      return {
        ...prevState,
        vault: vaults.find(({ isActive }) => isActive),
        vaults,
      };
    });
  };

  const updatePositions = (vault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        vaultProvider.compareVault(item, vault)
          ? {
              ...item,
              positions: { ...item.positions, ...vault.positions },
            }
          : item
      );

      setStoredVaults(vaults);

      return {
        ...prevState,
        vault: vaults.find(({ isActive }) => isActive),
        vaults,
      };
    });
  };

  const updateCoins = (
    token: CoinParams & CoinProps,
    vault: VaultProps,
    newCoins: CoinProps[]
  ): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        vaultProvider.compareVault(item, vault)
          ? {
              ...item,
              chains: item.chains.map((chain) =>
                chain.name === token.chain
                  ? {
                      ...vaultProvider.sortChain({
                        ...chain,
                        coins: [...chain.coins, ...newCoins],
                      }),
                    }
                  : chain
              ),
            }
          : item
      );

      setStoredVaults(vaults);

      return {
        ...prevState,
        vault: vaults.find(({ isActive }) => isActive),
        vaults,
      };
    });
  };

  const setTokens = (tokens: TokenProps[]): void => {
    setState((prevState) => ({ ...prevState, tokens }));
  };

  const loadVaults = (): VaultProps[] => {
    return getStoredVaults();
  };

  return {
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
  };
};
