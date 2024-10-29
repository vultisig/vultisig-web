import KeyMirror from "keymirror";

import { ChainKey, Currency, Language, Theme } from "utils/constants";
import { AddressesProps, Customization, VaultProps } from "utils/interfaces";

export const storageKey = KeyMirror({
  CHAIN_ADDRESSES: true,
  CURRENCY: true,
  CUSTOMIZATION: true,
  LANGUAGE: true,
  VAULTS: true,
});

export const getStoredAddress = (
  publicKey: string,
  chain: ChainKey
): string => {
  const addresses = getStoredAddresses();
  const vaultAddresses = addresses[publicKey];

  return vaultAddresses && (vaultAddresses[chain] || "");
};

export const setStoredAddress = (
  publicKey: string,
  chain: ChainKey,
  address: string
): void => {
  const addresses = getStoredAddresses();

  if (!addresses[publicKey]) addresses[publicKey] = {};

  addresses[publicKey][chain] = address;

  setStoredAddresses(addresses);
};

export const getStoredAddresses = (): AddressesProps => {
  try {
    const data = localStorage.getItem(storageKey.CHAIN_ADDRESSES);
    const addresses: AddressesProps = data ? JSON.parse(data) : {};

    return addresses;
  } catch {
    return {};
  }
};

export const setStoredAddresses = (addresses: AddressesProps): void => {
  localStorage.setItem(storageKey.CHAIN_ADDRESSES, JSON.stringify(addresses));
};

export const getStoredCustomization = (): Customization => {
  try {
    const data = localStorage.getItem(storageKey.CUSTOMIZATION);

    if (data) {
      const customization: Customization = JSON.parse(data);

      return customization;
    } else {
      throw new Error();
    }
  } catch {
    return { logo: "", theme: Theme.VULTISIG };
  }
};

export const setStoredCustomization = (customization: Customization): void => {
  localStorage.setItem(storageKey.CUSTOMIZATION, JSON.stringify(customization));
};

export const getStoredCurrency = (): Currency => {
  switch (localStorage.getItem(storageKey.CURRENCY)) {
    case Currency.AUD:
      return Currency.AUD;
    case Currency.CNY:
      return Currency.CNY;
    case Currency.CAD:
      return Currency.CAD;
    case Currency.EUR:
      return Currency.EUR;
    case Currency.GBP:
      return Currency.GBP;
    case Currency.JPY:
      return Currency.JPY;
    case Currency.RUB:
      return Currency.RUB;
    case Currency.SEK:
      return Currency.SEK;
    case Currency.SGD:
      return Currency.SGD;
    default:
      return Currency.USD;
  }
};

export const setStoredCurrency = (currency: Currency): void => {
  localStorage.setItem(storageKey.CURRENCY, currency);
};

export const getStoredLanguage = (): Language => {
  switch (localStorage.getItem(storageKey.LANGUAGE)) {
    case Language.CROATIA:
      return Language.CROATIA;
    case Language.DUTCH:
      return Language.DUTCH;
    case Language.GERMAN:
      return Language.GERMAN;
    case Language.ITALIAN:
      return Language.ITALIAN;
    case Language.PORTUGUESE:
      return Language.PORTUGUESE;
    case Language.RUSSIAN:
      return Language.RUSSIAN;
    case Language.SPANISH:
      return Language.SPANISH;
    default:
      return Language.ENGLISH;
  }
};

export const setStoredLanguage = (language: Language): void => {
  localStorage.setItem(storageKey.LANGUAGE, language);
};

export const getStoredVaults = (): VaultProps[] => {
  try {
    const data = localStorage.getItem(storageKey.VAULTS);
    const vaults: VaultProps[] = data ? JSON.parse(data) : [];

    return Array.isArray(vaults)
      ? vaults.map((vault) => ({ ...vault, chains: [], positions: {} }))
      : [];
  } catch {
    return [];
  }
};

export const setStoredVaults = (vaults: VaultProps[]): void => {
  localStorage.setItem(
    storageKey.VAULTS,
    JSON.stringify(
      vaults.map(
        ({ hexChainCode, isActive, publicKeyEcdsa, publicKeyEddsa, uid }) => ({
          isActive,
          hexChainCode,
          publicKeyEcdsa,
          publicKeyEddsa,
          uid,
        })
      )
    )
  );
};
