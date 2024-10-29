import { FC, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useBaseContext } from "context";
import { Currency, defTokens, LayoutKey } from "utils/constants";
import { ChainProps, TokenProps, VaultProps } from "utils/interfaces";
import {
  getStoredAddresses,
  getStoredVaults,
  setStoredAddresses,
  setStoredVaults,
} from "utils/storage";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import Header from "components/header";
import Preloader from "components/preloader";
import SplashScreen from "components/splash-screen";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";
import DeleteVault from "modals/delete-vault";
import LogoutVault from "modals/logout-vault";
import RenameVault from "modals/rename-vault";
import VaultSettings from "modals/vault-settings";
import SharedSettings from "modals/shared-settings";
import JoinAirDrop from "modals/join-airdrop";
import VaultProvider from "utils/vault-provider";

interface InitialState {
  tokens: TokenProps[];
  loading: boolean;
  vaults: VaultProps[];
  vault?: VaultProps;
}

const Component: FC = () => {
  const initialState: InitialState = {
    tokens: defTokens,
    loading: false,
    vaults: [],
  };
  const [state, setState] = useState(initialState);
  const { loading, tokens, vault, vaults } = state;
  const { changeCurrency, currency } = useBaseContext();
  const navigate = useNavigate();
  const vaultProvider = new VaultProvider();

  const updateCurrency = (currency: Currency): void => {
    if (!loading && vault) {
      setState((prevState) => ({ ...prevState, loading: true }));

      const coins = vault.chains.flatMap(({ coins }) => coins);

      vaultProvider.getValues(coins, currency).then((coins) => {
        changeCurrency(currency);

        updateVault({
          ...vault,
          chains: vault.chains.map((chain) => ({
            ...chain,
            coins: chain.coins.map(
              (coin) => coins.find(({ id }) => id === coin.id) || coin
            ),
          })),
          isActive: true,
          updated: true,
        });

        setState((prevState) => ({ ...prevState, currency, loading: false }));
      });
    }
  };

  const toggleToken = (token: TokenProps, vault: VaultProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      vaultProvider
        .toggleToken(token, vault, currency)
        .then((vault) => {
          updateVault(vault);

          resolve();
        })
        .catch(reject);
    });
  };

  const getTokens = (chain: ChainProps): Promise<void> => {
    return new Promise((resolve) => {
      vaultProvider.getTokens(chain).then((tokens) => {
        setState((prevState) => ({ ...prevState, tokens }));

        resolve();
      });
    });
  };

  const changeVault = (vault: VaultProps, prepare?: boolean): void => {
    vault.isActive = true;

    updateVault(vault);

    if (prepare && !vault.updated) {
      prepareVault(vault)
        .then((vault) => {
          updateVault(vault);
        })
        .catch(() => {});
    }
  };

  const deleteVault = (vault: VaultProps): void => {
    const modifiedVaults = vaults.filter(({ uid }) => uid !== vault.uid);
    const addresses = getStoredAddresses();

    delete addresses[vault.publicKeyEcdsa];
    delete addresses[vault.publicKeyEddsa];

    setStoredAddresses(addresses);

    if (modifiedVaults.length) {
      const activeVault = modifiedVaults.find(({ isActive }) => isActive);
      const [vault] = activeVault ? [activeVault] : modifiedVaults;

      vault.isActive = true;

      setState((prevState) => ({
        ...prevState,
        vault,
        vaults: modifiedVaults,
      }));

      setStoredVaults([
        vault,
        ...modifiedVaults.filter(({ uid }) => uid !== vault.uid),
      ]);
    } else {
      setStoredVaults([]);

      navigate(constantPaths.import, { replace: true });
    }
  };

  const fetchVault = (vault: VaultProps): Promise<VaultProps | undefined> => {
    return new Promise((resolve) => {
      api.vault
        .get(vault)
        .then(({ data }) => {
          resolve({ ...vault, ...data, updated: false });
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
      const modifiedVault = vaultProvider.prepareVault(vault);

      const vaults = prevState.vaults.map((vault) =>
        vaultProvider.compareVault(vault, modifiedVault)
          ? modifiedVault
          : {
              ...vault,
              isActive: modifiedVault.isActive ? false : vault.isActive,
            }
      );

      setStoredVaults(vaults);

      return { ...prevState, vault, vaults };
    });
  };

  const updateVaultPositions = (vault: VaultProps): void => {
    setState((prevState) => {
      const modifiedVault = prevState.vault
        ? {
            ...prevState.vault,
            positions: { ...prevState.vault.positions, ...vault.positions },
          }
        : vault;

      const vaults = prevState.vaults.map((vault) =>
        vaultProvider.compareVault(vault, modifiedVault) ? modifiedVault : vault
      );

      setStoredVaults(vaults);

      return { ...prevState, vault: modifiedVault, vaults };
    });
  };

  const componentDidMount = (): void => {
    const vaults = getStoredVaults();

    if (vaults.length) {
      const promises = vaults.map((vault) => fetchVault(vault));

      Promise.all(promises).then((updatedVaults) => {
        const vaults = updatedVaults.filter((vault) => vault !== undefined);

        if (vaults.length) {
          const activeVault = vaults.find(({ isActive }) => isActive);
          const [vault] = activeVault ? [activeVault] : vaults;

          setState((prevState) => ({
            ...prevState,
            vault: { ...vault, isActive: true },
            vaults: vaults.map((item) => ({
              ...item,
              isActive: vaultProvider.compareVault(item, vault),
            })),
          }));

          setStoredVaults(vaults);
        } else {
          navigate(constantPaths.import, { replace: true });
        }
      });
    } else {
      navigate(constantPaths.import, { replace: true });
    }
  };

  useEffect(componentDidMount, []);

  return vault ? (
    <>
      <div className="layout">
        <Header
          alias={vault.alias}
          layout={LayoutKey.VAULT}
          logo={vault.logo}
          uid={vault.uid}
        />
        <Outlet
          context={{
            changeVault,
            deleteVault,
            getTokens,
            toggleToken,
            updateVault,
            updateVaultPositions,
            layout: LayoutKey.VAULT,
            tokens,
            vault,
            vaults,
          }}
        />
      </div>
      <ChangeCurrency onChange={updateCurrency} />
      <ChangeLanguage />
      <JoinAirDrop updateVault={updateVault} vaults={vaults} />
      <RenameVault updateVault={updateVault} vault={vault} />
      <DeleteVault deleteVault={deleteVault} vault={vault} />
      <LogoutVault deleteVault={deleteVault} vault={vault} />
      <VaultSettings vault={vault} />
      <SharedSettings vault={vault} />
      <Preloader visible={loading} />
    </>
  ) : (
    <SplashScreen />
  );
};

export default Component;
