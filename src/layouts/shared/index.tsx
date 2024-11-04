import { FC, useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useBaseContext } from "context";
import { Currency, LayoutKey } from "utils/constants";
import { changeTheme } from "utils/functions";
import { ChainProps, VaultProps } from "utils/interfaces";
import api from "utils/api";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";
import VaultProvider from "utils/vault-provider";

import Header from "components/header";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";
import Preloader from "components/preloader";
import SplashScreen from "components/splash-screen";

interface InitialState {
  loading: boolean;
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false };
  const [state, setState] = useState(initialState);
  const { loading, vault } = state;
  const { alias, chainKey, uid } = useParams<{
    alias?: string;
    chainKey?: string;
    uid: string;
  }>();
  const { changeCurrency, currency } = useBaseContext();
  const vaultProvider = new VaultProvider();
  const navigate = useNavigate();

  const handleCurrency = (currency: Currency) => {
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
        });

        setState((prevState) => ({ ...prevState, currency, loading: false }));
      });
    }
  };

  const prepareChain = (chain: ChainProps): void => {
    vaultProvider.prepareChain(chain, currency).then((chain) => {
      setState((prevState) =>
        prevState.vault
          ? {
              ...prevState,
              vault: {
                ...prevState.vault,
                chains: prevState.vault.chains.map((item) =>
                  item.name === chain.name
                    ? vaultProvider.sortChain(chain)
                    : item
                ),
              },
            }
          : prevState
      );
    });
  };

  const updateVault = (vault: VaultProps): void => {
    setState((prevState) => ({ ...prevState, vault }));
  };

  const updatePositions = (vault: VaultProps): void => {
    setState((prevState) => {
      const modifiedVault = prevState.vault
        ? {
            ...prevState.vault,
            positions: { ...prevState.vault.positions, ...vault.positions },
          }
        : vault;

      return { ...prevState, vault: modifiedVault };
    });
  };

  const componentDidMount = (): void => {
    if (uid && /^[a-fA-F0-9]{64}$/.test(uid)) {
      api.vault
        .getById(uid)
        .then(({ data }) => {
          api.sharedSettings.get(uid).then(({ data: { logo, theme } }) => {
            changeTheme(theme);

            setState((prevState) => ({
              ...prevState,
              vault: { ...data, logo, positions: {}, theme },
            }));

            if (!alias) {
              navigate(
                (chainKey
                  ? constantPaths.shared.assetsAlias.replace(
                      ":chainKey",
                      chainKey
                    )
                  : constantPaths.shared.chainsAlias
                )
                  .replace(":alias", data.alias.replace(/ /g, "-"))
                  .replace(":uid", data.uid),
                {
                  replace: true,
                }
              );
            }
          });
        })
        .catch(() => {
          navigate(constantPaths.root, { replace: true });
        });
    } else {
      navigate(constantPaths.root, { replace: true });
    }
  };

  useEffect(componentDidMount, []);

  return vault ? (
    <>
      <div className="layout layout-shared">
        <Header
          alias={vault.alias}
          layout={LayoutKey.SHARED}
          logo={vault.logo}
          uid={vault.uid}
        />
        <Outlet
          context={{
            layout: LayoutKey.SHARED,
            vault,
            prepareChain,
            updateVault,
            updatePositions,
          }}
        />
        <div className="layout-footer">
          <span className="powered_by">{t(constantKeys.POWERED_BY)} </span>
          <Link to="https://vultisig.com/">Vultisig</Link>
        </div>
      </div>
      <ChangeCurrency onChange={handleCurrency} />
      <ChangeLanguage />
      <Preloader visible={loading} />
    </>
  ) : (
    <SplashScreen />
  );
};

export default Component;
