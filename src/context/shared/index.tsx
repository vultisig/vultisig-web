import {
  FC,
  ReactNode,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useBaseContext } from "context/base";
import { Currency } from "utils/constants";
import { CoinProps, VaultProps } from "utils/interfaces";
import api from "utils/api";
import constantPaths from "routes/constant-paths";
import VaultProvider from "utils/vault-provider";

import Header from "components/header";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";
import Footer from "components/footer";
import Preloader from "components/preloader";
import SplashScreen from "components/splash-screen";
import { changeTheme } from "utils/functions";

interface SharedContext {
  vault?: VaultProps;
}

interface InitialState {
  loaded: boolean;
  loading: boolean;
  vault?: VaultProps;
}

const SharedContext = createContext<SharedContext | undefined>(undefined);

const Component: FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: InitialState = { loaded: false, loading: true };
  const [state, setState] = useState(initialState);
  const { loaded, loading, vault } = state;
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
        loaded: true,
        loading: false,
        vault: {
          ...vault,
          chains: vault.chains.map((chain) => ({
            ...chain,
            coins: chain.coins.map(
              (coin) => coins.find(({ id }) => id === coin.id) || coin
            ),
          })),
        },
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

  return (
    <SharedContext.Provider value={{ vault }}>
      {loaded ? (
        <>
          <div className="layout layout-shared">
            <Header logo={vault?.logo} alias={vault?.alias} />
            {children}
            <Footer />
          </div>
          <ChangeCurrency onChange={handleCurrency} />
          <ChangeLanguage />
          <Preloader visible={loading} />
        </>
      ) : (
        <SplashScreen />
      )}
    </SharedContext.Provider>
  );
};

export default Component;

export const useSharedContext = (): SharedContext => {
  const context = useContext(SharedContext);

  if (!context) {
    throw new Error("useSharedContext must be used within a SharedProvider");
  }

  return context;
};
