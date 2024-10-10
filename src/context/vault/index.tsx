import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useBaseContext } from "context/base";
import { Currency, defTokens } from "utils/constants";
import { ChainProps, TokenProps, VaultProps } from "utils/interfaces";
import { getStoredVaults, setStoredVaults } from "utils/storage";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import Header from "components/header";
import Preloader from "components/preloader";
import SplashScreen from "components/splash-screen";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";
import DeleteVault from "modals/delete-vault";
import RenameVault from "modals/rename-vault";
import VaultSettings from "modals/vault-settings";
import SharedSettings from "modals/shared-settings";
import JoinAirDrop from "modals/join-airdrop";
import VaultProvider from "utils/vault-provider";

interface VaultContext {
  getTokens: (chain: ChainProps) => Promise<void>;
  changeVault: (vault: VaultProps, prepare?: boolean) => void;
  deleteVault: (vault: VaultProps) => void;
  updateVault: (vault: VaultProps) => void;
  toggleToken: (coin: TokenProps, vault: VaultProps) => Promise<void>;
  loading: boolean;
  tokens: TokenProps[];
  vault?: VaultProps;
  vaults: VaultProps[];
}

interface InitialState {
  tokens: TokenProps[];
  loaded: boolean;
  loading: boolean;
  vaults: VaultProps[];
  vault?: VaultProps;
}

const VaultContext = createContext<VaultContext | undefined>(undefined);

const Component: FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: InitialState = {
    tokens: defTokens,
    loaded: false,
    loading: false,
    vaults: [],
  };
  const [state, setState] = useState(initialState);
  const { loaded, loading, tokens, vault, vaults } = state;
  const { changeCurrency, currency } = useBaseContext();
  const navigate = useNavigate();
  const vaultProvider = new VaultProvider();

  const updateCurrency = (currency: Currency): void => {
    if (!loading && vault) {
      setState((prevState) => ({ ...prevState, loading: true }));

      const coins = vault.chains.flatMap(({ coins }) => coins);

      vaultProvider.getValues(coins, currency).then((coins) => {
        changeCurrency(currency);

        const modifiedVault = {
          ...vault,
          chains: vault.chains.map((chain) => ({
            ...chain,
            coins: chain.coins.map(
              (coin) => coins.find(({ id }) => id === coin.id) || coin
            ),
          })),
          updated: true,
        };

        setState((prevState) => ({
          ...prevState,
          currency,
          loading: false,
          vault: modifiedVault,
          vaults: vaults.map((vault) => ({
            ...vault,
            updated: vault.uid === modifiedVault.uid,
          })),
        }));
      });
    }
  };

  const toggleToken = (token: TokenProps, vault: VaultProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      vaultProvider
        .toggleToken(token, vault, currency)
        .then((modifiedVault) => {
          setState((prevState) => ({
            ...prevState,
            vault:
              prevState.vault?.uid === modifiedVault.uid
                ? modifiedVault
                : prevState.vault,
          }));

          resolve();
        })
        .catch(reject);
    });
  };

  const getTokens = (chain: ChainProps): Promise<void> => {
    return new Promise((resolve) => {
      vaultProvider
        .getTokens(chain)
        .then((tokens) => {
          setState((prevState) => ({ ...prevState, tokens }));

          resolve();
        })
        .catch(() => {
          setState((prevState) => ({ ...prevState, tokens: [] }));

          resolve();
        });
    });
  };

  const changeVault = (vault: VaultProps, prepare?: boolean): void => {
    setState((prevState) => ({ ...prevState, vault }));

    if (prepare && !vault.updated) {
      prepareVault(vault)
        .then((vault) => {
          vault.updated = true;

          setState((prevState) => ({
            ...prevState,
            vault,
            vaults: prevState.vaults.map((item) =>
              item.uid === vault.uid ? vault : item
            ),
          }));
        })
        .catch(() => {});
    }
  };

  const deleteVault = (vault: VaultProps): void => {
    const modifiedVaults = vaults.filter(({ uid }) => uid !== vault.uid);

    if (modifiedVaults.length) {
      const [vault] = modifiedVaults;

      setState((prevState) => ({
        ...prevState,
        vault,
        vaults: modifiedVaults,
      }));

      setStoredVaults(modifiedVaults);
    } else {
      navigate(constantPaths.import);
    }
  };

  const fetchVault = (vault: VaultProps): Promise<VaultProps | undefined> => {
    return new Promise((resolve) => {
      api.vault
        .get(vault)
        .then(({ data }) => {
          api.sharedSettings
            .get(vault.uid)
            .then(({ data: { logo, theme } }) => {
              resolve({ ...data, ...{ logo, theme } });
            });
        })
        .catch(() => resolve(undefined));
    });
  };

  const prepareVault = (vault: VaultProps): Promise<VaultProps> => {
    return new Promise((resolve, reject) => {
      if (vault.chains.length) {
        const promises = vault.chains.flatMap(({ address, coins, name }) =>
          coins.map((coin) => vaultProvider.getBalance(coin, name, address))
        );

        Promise.all(promises).then((coins) => {
          vaultProvider.getValues(coins, currency).then((coins) => {
            resolve({
              ...vault,
              chains: vault.chains.map((chain) => ({
                ...chain,
                coins: chain.coins.map(
                  (coin) => coins.find(({ id }) => id === coin.id) || coin
                ),
              })),
              hexChainCode: vault.hexChainCode,
              updated: true,
            });
          });
        });
      } else {
        const promises = tokens
          .filter((coin) => coin.isDefault)
          .map((coin) =>
            vaultProvider.addToken(
              coin,
              { ...vault, hexChainCode: vault.hexChainCode },
              currency
            )
          );

        Promise.all(promises)
          .then((chains) => {
            prepareVault({
              ...vault,
              chains: chains.map(
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
                  hexPublicKey,
                })
              ),
            })
              .then(resolve)
              .catch(reject);
          })
          .catch(reject);
      }
    });
  };

  const updateVault = (vault: VaultProps): void => {
    setState((prevState) => {
      const vaults = prevState.vaults.map((item) =>
        item.uid === vault.uid ? vault : item
      );

      setStoredVaults(vaults);

      return {
        ...prevState,
        vault: prevState.vault?.uid === vault.uid ? vault : prevState.vault,
        vaults,
      };
    });
  };

  const componentDidMount = (): void => {
    const vaults = getStoredVaults();

    if (vaults.length) {
      const promises = vaults.map((vault) => fetchVault(vault));

      Promise.all(promises).then((updatedVaults) => {
        const vaults = updatedVaults.filter((vault) => vault !== undefined);

        if (vaults.length) {
          const [vault] = vaults;

          setState((prevState) => ({
            ...prevState,
            loaded: true,
            vault,
            vaults,
          }));
        } else {
          navigate(constantPaths.import, { replace: true });
        }
      });
    } else {
      navigate(constantPaths.import, { replace: true });
    }
  };

  useEffect(componentDidMount, []);

  return (
    <VaultContext.Provider
      value={{
        changeVault,
        deleteVault,
        getTokens,
        toggleToken,
        updateVault,
        loading,
        tokens,
        vault,
        vaults,
      }}
    >
      {loaded ? (
        <>
          <div className="layout">
            <Header uid={vault?.uid} alias={vault?.alias} />
            {children}
          </div>
          <ChangeCurrency onChange={updateCurrency} />
          <ChangeLanguage />
          <DeleteVault delVault={deleteVault} vault={vault} />
          <RenameVault setVault={updateVault} vault={vault} />
          <VaultSettings vault={vault} />
          <SharedSettings vault={vault} updateVault={updateVault} />
          <Preloader visible={loading} />
          <JoinAirDrop />
        </>
      ) : (
        <SplashScreen />
      )}
    </VaultContext.Provider>
  );
};

export default Component;

export const useVaultContext = (): VaultContext => {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVaultContext must be used within a VaultProvider");
  }

  return context;
};
