import {
  FC,
  ReactNode,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";

import { Currency, Language, storageKey } from "utils/constants";
import i18n from "i18n/config";

interface BaseContext {
  setCurrency: (currency: Currency) => void;
  currency: Currency;
}

interface InitialState {
  currency: Currency;
}

const BaseContext = createContext<BaseContext | undefined>(undefined);

const Component: FC<{ children: ReactNode }> = ({ children }) => {
  const initialState: InitialState = { currency: Currency.USD };
  const [state, setState] = useState(initialState);
  const { currency } = state;

  const setCurrency = (currency: Currency): void => {
    localStorage.setItem(storageKey.CURRENCY, currency);

    setState((prevState) => ({ ...prevState, currency }));
  };

  const componentDidMount = () => {
    let currency: Currency;
    let language: Language;

    switch (localStorage.getItem(storageKey.CURRENCY)) {
      case Currency.AUD:
        currency = Currency.AUD;
        break;
      case Currency.CNY:
        currency = Currency.CNY;
        break;
      case Currency.CAD:
        currency = Currency.CAD;
        break;
      case Currency.EUR:
        currency = Currency.EUR;
        break;
      case Currency.GBP:
        currency = Currency.GBP;
        break;
      case Currency.JPY:
        currency = Currency.JPY;
        break;
      case Currency.RUB:
        currency = Currency.RUB;
        break;
      case Currency.SEK:
        currency = Currency.SEK;
        break;
      case Currency.SGD:
        currency = Currency.SGD;
        break;
      default:
        currency = Currency.USD;
        break;
    }

    switch (localStorage.getItem(storageKey.LANGUAGE)) {
      case Language.CROATIA:
        language = Language.CROATIA;
        break;
      case Language.DUTCH:
        language = Language.DUTCH;
        break;
      case Language.GERMAN:
        language = Language.GERMAN;
        break;
      case Language.ITALIAN:
        language = Language.ITALIAN;
        break;
      case Language.PORTUGUESE:
        language = Language.PORTUGUESE;
        break;
      case Language.RUSSIAN:
        language = Language.RUSSIAN;
        break;
      case Language.SPANISH:
        language = Language.SPANISH;
        break;
      default:
        language = Language.ENGLISH;
        break;
    }

    i18n.changeLanguage(language);

    setState((prevState) => ({ ...prevState, currency }));
  };

  useEffect(componentDidMount, []);

  return (
    <BaseContext.Provider value={{ setCurrency, currency }}>
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
