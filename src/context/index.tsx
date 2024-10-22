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

interface BaseContext {
  changeCurrency: (currency: Currency) => void;
  changeLanguage: (language: Language) => void;
  changePage: (language: PageKey) => void;
  activePage: PageKey;
  currency: Currency;
  language: Language;
}

interface InitialState {
  activePage: PageKey;
  currency: Currency;
  language: Language;
}

const BaseContext = createContext<BaseContext | undefined>(undefined);

const Component: FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: InitialState = {
    activePage: PageKey.IMPORT,
    currency: getStoredCurrency(),
    language: getStoredLanguage(),
  };
  const [state, setState] = useState(initialState);
  const { activePage, currency, language } = state;

  const changeCurrency = (currency: Currency): void => {
    setStoredCurrency(currency);

    setState((prevState) => ({ ...prevState, currency }));
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
  };

  useEffect(componentDidMount, []);

  return (
    <BaseContext.Provider
      value={{
        changeCurrency,
        changeLanguage,
        changePage,
        activePage,
        currency,
        language,
      }}
    >
      {children}
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
