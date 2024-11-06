import {
  FC,
  ReactNode,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";

import { Currency, Language, PageKey } from "utils/constants";
import {
  getStoredCurrency,
  getStoredLanguage,
  setStoredCurrency,
  setStoredLanguage,
} from "utils/storage";
import i18n from "i18n/config";
import api from "utils/api";

import Preloader from "components/preloader";

interface BaseContext {
  changeCurrency: (currency: Currency) => void;
  changeLanguage: (language: Language) => void;
  changePage: (language: PageKey) => void;
  activePage: PageKey;
  baseValue: number;
  currency: Currency;
  language: Language;
}

interface InitialState {
  activePage: PageKey;
  baseValue: number;
  currency: Currency;
  language: Language;
  loading: boolean;
}

const BaseContext = createContext<BaseContext | undefined>(undefined);

const Component: FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: InitialState = {
    activePage: PageKey.IMPORT,
    baseValue: 0,
    currency: getStoredCurrency(),
    language: getStoredLanguage(),
    loading: false,
  };
  const [state, setState] = useState(initialState);
  const { activePage, baseValue, currency, language, loading } = state;

  const changeCurrency = (currency: Currency): void => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: true }));

      api.coin.value(825, currency).then((baseValue) => {
        setState((prevState) => ({
          ...prevState,
          baseValue,
          currency,
          loading: false,
        }));

        setStoredCurrency(currency);
      });
    }
  };

  const changeLanguage = (language: Language): void => {
    setStoredLanguage(language);

    i18n.changeLanguage(language);

    setState((prevState) => ({ ...prevState, language }));
  };

  const changePage = (activePage: PageKey): void => {
    setState((prevState) => ({ ...prevState, activePage }));
  };

  const componentDidMount = () => {
    i18n.changeLanguage(language);

    api.coin.value(825, currency).then((baseValue) => {
      setState((prevState) => ({ ...prevState, baseValue }));
    });
  };

  useEffect(componentDidMount, []);

  return (
    <BaseContext.Provider
      value={{
        changeCurrency,
        changeLanguage,
        changePage,
        activePage,
        baseValue,
        currency,
        language,
      }}
    >
      {children}
      <Preloader visible={loading} />
    </BaseContext.Provider>
  );
};

export default Component;

export const useBaseContext = (): BaseContext => {
  const context = useContext(BaseContext);

  if (!context) {
    throw new Error("useBaseContext must be used within a BaseProvider");
  }

  return context;
};
