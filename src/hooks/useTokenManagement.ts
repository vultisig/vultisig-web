import { useCallback } from "react";
import {
  ChainProps,
  CoinParams,
  CoinProps,
  TokenProps,
  VaultProps,
} from "utils/interfaces";
import { Currency, balanceAPI, oneInchRef } from "utils/constants";
import { setStoredVaults } from "utils/storage";
import VaultProvider from "utils/vault-provider";
import api from "utils/api";

interface UseTokenManagementProps {
  vaults: VaultProps[];
  vaultProvider: VaultProvider;
  onVaultsUpdate: (vaults: VaultProps[]) => void;
}

export const useTokenManagement = ({
  vaults,
  vaultProvider,
  onVaultsUpdate,
}: UseTokenManagementProps) => {
  const discoverAssets = useCallback(
    async (token: CoinParams & CoinProps, vault: VaultProps): Promise<void> => {
      const oneInchId = oneInchRef[token.chain];

      if (!oneInchId) return;

      try {
        const path = balanceAPI[token.chain];
        const discoveredTokens = await api.discovery.tokens(path, token.address);
        const updatedTokens = await api.coin.getInfo(
          oneInchId,
          discoveredTokens.map(({ contractAddress }) => contractAddress)
        );

        const coinPromises = discoveredTokens
          .filter(({ contractAddress }) => !!updatedTokens[contractAddress])
          .map(async ({ contractAddress, tokenBalance }) => {
            const cmcId = await api.coin.cmc(contractAddress);
            const decimals = updatedTokens[contractAddress].decimals;

            return {
              address: token.address,
              balance: parseInt(tokenBalance, 16) / Math.pow(10, decimals),
              chain: token.chain,
              cmcId,
              contractAddress: contractAddress,
              decimals,
              hexPublicKey:
                token.hexPublicKey === "ECDSA"
                  ? vault.publicKeyEcdsa
                  : vault.publicKeyEddsa,
              isNative: false,
              logo: updatedTokens[contractAddress].logoURI || "",
              ticker: updatedTokens[contractAddress].symbol,
            };
          });

        const coins = await Promise.all(coinPromises);

        const addCoinPromises = coins
          .filter(({ cmcId }) => cmcId)
          .map(async ({ balance, ...coin }) => {
            try {
              const id = await api.coin.add(vault, coin);
              return { ...coin, balance, id, value: 0 };
            } catch {
              return { ...coin, balance, id: 0, value: 0 };
            }
          });

        const addedCoins = await Promise.all(addCoinPromises);
        const validCoins = addedCoins.filter(({ id }) => id);

        const newCoins = await vaultProvider.getValues(validCoins, Currency.USD);

        const updatedVaults = vaults.map((item) =>
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

        setStoredVaults(updatedVaults);
        onVaultsUpdate(updatedVaults);
      } catch (error) {
        console.error("Failed to discover assets:", error);
      }
    },
    [vaults, vaultProvider, onVaultsUpdate]
  );

  const removeToken = useCallback(
    async (
      token: TokenProps,
      vault: VaultProps,
      selectedCoin: CoinProps
    ): Promise<void> => {
      await api.coin.del(vault, selectedCoin);

      const updatedVaults = vaults.map((item) =>
        vaultProvider.compareVault(item, vault)
          ? {
              ...item,
              chains: token.isNative
                ? vault.chains.filter(({ name }) => name !== token.chain)
                : vault.chains.map((chain) =>
                    chain.name === token.chain
                      ? {
                          ...chain,
                          ...vaultProvider.sortChain({
                            ...chain,
                            coins: chain.coins.filter(
                              ({ ticker }) => token.ticker !== ticker
                            ),
                          }),
                        }
                      : chain
                  ),
            }
          : item
      );

      setStoredVaults(updatedVaults);
      onVaultsUpdate(updatedVaults);
    },
    [vaults, vaultProvider, onVaultsUpdate]
  );

  const addToken = useCallback(
    async (
      token: TokenProps,
      vault: VaultProps,
      selectedChain?: ChainProps
    ): Promise<void> => {
      const newToken = await vaultProvider.addToken(token, vault);

      const updatedVaults = vaults.map((item) =>
        vaultProvider.compareVault(item, vault)
          ? {
              ...item,
              chains: selectedChain
                ? item.chains.map((chain) =>
                    chain.name === selectedChain.name
                      ? {
                          ...chain,
                          coins: [...chain.coins, newToken],
                        }
                      : chain
                  )
                : [
                    ...item.chains,
                    {
                      address: newToken.address,
                      balance: 0,
                      coins: [newToken],
                      hexPublicKey: newToken.hexPublicKey,
                      name: newToken.chain,
                      nfts: [],
                    },
                  ],
            }
          : item
      );

      setStoredVaults(updatedVaults);
      onVaultsUpdate(updatedVaults);

      // Fetch balance and value for the new token
      if (selectedChain) {
        try {
          const balance = await vaultProvider.getBalance(
            newToken.address,
            newToken.chain,
            newToken.contractAddress,
            newToken.decimals,
            newToken.isNative,
            newToken.ticker
          );

          if (balance) {
            newToken.balance = balance;

            const [{ value }] = await vaultProvider.getValues(
              [newToken],
              Currency.USD
            );
            newToken.value = value;

            const finalVaults = vaults.map((item) =>
              vaultProvider.compareVault(item, vault)
                ? {
                    ...item,
                    chains: item.chains.map((chain) =>
                      chain.name === selectedChain.name
                        ? {
                            ...vaultProvider.sortChain({
                              ...chain,
                              coins: chain.coins.map((coin) =>
                                coin.ticker === newToken.ticker
                                  ? { ...coin, balance, value }
                                  : coin
                              ),
                            }),
                          }
                        : chain
                    ),
                  }
                : item
            );

            setStoredVaults(finalVaults);
            onVaultsUpdate(finalVaults);
          }
        } catch (error) {
          console.error("Failed to fetch token balance:", error);
        }
      } else {
        await discoverAssets(newToken, vault);
      }
    },
    [vaults, vaultProvider, onVaultsUpdate, discoverAssets]
  );

  const toggleToken = useCallback(
    async (token: TokenProps, vault: VaultProps): Promise<void> => {
      const selectedChain = vault.chains.find(({ name }) => name === token.chain);
      const selectedCoin = selectedChain?.coins.find(
        ({ ticker }) => ticker === token.ticker
      );

      if (selectedCoin) {
        await removeToken(token, vault, selectedCoin);
      } else {
        await addToken(token, vault, selectedChain);
      }
    },
    [removeToken, addToken]
  );

  const getTokens = useCallback(
    async (chain: ChainProps): Promise<TokenProps[]> => {
      return await vaultProvider.getTokens(chain);
    },
    [vaultProvider]
  );

  return {
    toggleToken,
    getTokens,
    discoverAssets,
  };
};

