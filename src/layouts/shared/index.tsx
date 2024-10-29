import { FC, useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useBaseContext } from "context";
import { Currency, LayoutKey } from "utils/constants";
import { changeTheme } from "utils/functions";
import { CoinProps, VaultProps } from "utils/interfaces";
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
  const initialState: InitialState = { loading: true };
  const [state, setState] = useState(initialState);
  const { loading, vault } = state;
  const { uid } = useParams();
  const { changeCurrency, currency } = useBaseContext();
  const vaultProvider = new VaultProvider();
  const navigate = useNavigate();

  const changeValue = (
    coins: CoinProps[],
    currency: Currency,
    vault: VaultProps
  ) => {
    vaultProvider.getValues(coins, currency).then((coins) => {
      changeCurrency(currency);

      setState((prevState) => ({
        ...prevState,
        loading: false,
        vault: vaultProvider.prepareVault({
          ...vault,
          positions: vault.positions??{},
          chains: vault.chains.map((chain) => ({
            ...chain,
            coins: chain.coins.map(
              (coin) => coins.find(({ id }) => id === coin.id) || coin
            ),
          })),
          updated: true,
        }),
      }));
    });
  };

  const handleCurrency = (currency: Currency) => {
    if (vault) {
      setState((prevState) => ({ ...prevState, loading: true }));

      const coins = vault.chains.flatMap(({ coins }) => coins);

      changeValue(coins, currency, vault);
    }
  };

  const updateVault = (vault: VaultProps): void => {
    setState((prevState) => ({ ...prevState, vault }));
  };

  const updateVaultPositions = (vault: VaultProps): void => {
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
            const promises = data.chains.flatMap(({ address, coins, name }) =>
              coins.map((coin) => vaultProvider.getBalance(coin, name, address))
            );

            Promise.all(promises).then((coins) =>
              changeValue(coins, currency, { ...data, logo, theme })
            );

            changeTheme(theme);
          });
        })
        .catch(() => {
          navigate(constantPaths.root);
        });
    } else {
      navigate(constantPaths.root);
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
            updateVault,
            updateVaultPositions,
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
