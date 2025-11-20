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
  updateCoins: (
    token: CoinParams & CoinProps,
    vault: VaultProps,
    newCoins: CoinProps[]
  ) => void;
}

export const useTokenManagement = ({
  vaults,
  vaultProvider,
  onVaultsUpdate,
  updateCoins,
}: UseTokenManagementProps) => {
  const discoverAssets = async (
    token: CoinParams & CoinProps,
    vault: VaultProps
  ): Promise<void> => {
    const oneInchId = oneInchRef[token.chain];

    if (oneInchId) {
      const path = balanceAPI[token.chain];

      api.discovery.tokens(path, token.address).then((discoveredTokens) => {
        api.coin
          .getInfo(
            oneInchId,
            discoveredTokens.map(({ contractAddress }) => contractAddress)
          )
          .then((updatedTokens) => {
            const promises = discoveredTokens
              .filter(({ contractAddress }) => !!updatedTokens[contractAddress])
              .map(({ contractAddress, tokenBalance }) =>
                api.coin.cmc(contractAddress).then((cmcId) => {
                  const decimals = updatedTokens[contractAddress].decimals;

                  return {
                    address: token.address,
                    balance:
                      parseInt(tokenBalance, 16) / Math.pow(10, decimals),
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
                })
              );

            Promise.all(promises).then((coins) => {
              const promises = coins
                .filter(({ cmcId }) => cmcId)
                .map(({ balance, ...coin }) =>
                  api.coin
                    .add(vault, coin)
                    .catch(() => 0)
                    .then((id) => ({ ...coin, balance, id, value: 0 }))
                );

              Promise.all(promises).then((coins) => {
                const validCoins = coins.filter(({ id }) => id);

                vaultProvider
                  .getValues(validCoins, Currency.USD)
                  .then((newCoins) => {
                    updateCoins(token, vault, newCoins);
                  });
              });
            });
          });
      });
    }
  };

  const removeToken = async (
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
  };

  const addToken = async (
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

          const finalVaults = updatedVaults.map((item) =>
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
  };

  const toggleToken = async (
    token: TokenProps,
    vault: VaultProps
  ): Promise<void> => {
    const selectedChain = vault.chains.find(({ name }) => name === token.chain);
    const selectedCoin = selectedChain?.coins.find(
      ({ ticker }) => ticker === token.ticker
    );

    if (selectedCoin) {
      await removeToken(token, vault, selectedCoin);
    } else {
      await addToken(token, vault, selectedChain);
    }
  };

  const getTokens = async (chain: ChainProps): Promise<TokenProps[]> => {
    return await vaultProvider.getTokens(chain);
  };

  return {
    toggleToken,
    getTokens,
    discoverAssets,
  };
};
