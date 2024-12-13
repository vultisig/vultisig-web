import { ChainKey, defTokens, Theme, TickerKey } from "utils/constants";

const isArray = (arr: any): arr is any[] => {
  return Array.isArray(arr);
};

const isObject = (obj: any): obj is Record<string, any> => {
  return obj === Object(obj) && !isArray(obj) && typeof obj !== "function";
};

const toCamel = (value: string): string => {
  return value.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "");
  });
};

const toSnake = (value: string): string => {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const changeTheme = (theme?: Theme): void => {
  document.documentElement.setAttribute("theme", theme ?? "");
};

export const isCounted = (
  chain: ChainKey,
  isNative: boolean,
  ticker: string
): boolean => {
  const validTickers: string[] = [
    TickerKey.JUP,
    TickerKey.RNDR,
    TickerKey.USDC,
    TickerKey.USDT,
    TickerKey.DORITO,
    TickerKey.KWEEN,
  ];

  return (
    isNative || chain !== ChainKey.SOLANA || validTickers.indexOf(ticker) >= 0
  );
};

export const isNewToken = (contractAddress: string): boolean => {
  return (
    defTokens.findIndex(
      (token) =>
        token.contractAddress.toLowerCase() === contractAddress.toLowerCase()
    ) < 0
  );
};

export const toCamelCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {};

    Object.keys(obj).forEach((k) => {
      n[toCamel(k)] = toCamelCase(obj[k]);
    });

    return n;
  } else if (isArray(obj)) {
    return obj.map((i) => {
      return toCamelCase(i);
    });
  }

  return obj;
};

export const toSnakeCase = (obj: any): any => {
  if (isObject(obj)) {
    const n: Record<string, any> = {};

    Object.keys(obj).forEach((k) => {
      n[toSnake(k)] = toSnakeCase(obj[k]);
    });

    return n;
  } else if (isArray(obj)) {
    return obj.map((i) => {
      return toSnakeCase(i);
    });
  }

  return obj;
};
