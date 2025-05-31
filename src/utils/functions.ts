import { ChainKey, defTokens, Theme, TickerKey } from "utils/constants";
import { Activities, SeasonInfo, VaultProps } from "utils/interfaces";

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
  document.documentElement.setAttribute("theme", theme || "");
};

export const getAssetsBalance = (vault: VaultProps): number => {
  return vault.chains.reduce((acc, { balance = 0 }) => acc + balance, 0);
};

export const getNFTsBalance = (vault: VaultProps): number => {
  return vault.chains.reduce(
    (acc, { nfts, nftsBalance = 0 }) => acc + nftsBalance * nfts.length,
    0
  );
};

export const getPositionsBalance = (vault: VaultProps): number => {
  let totalSum = 0;

  Object.values(vault.positions).forEach((items) => {
    if (Array.isArray(items)) {
      totalSum += items.reduce((total, position) => {
        const basePrice = Number(position.base?.price) || 0;
        const baseReward = Number(position.base?.reward) || 0;
        const targetPrice = Number(position.target?.price) || 0;

        return total + basePrice + baseReward + targetPrice;
      }, 0);
    }
  });

  return totalSum;
};

export const isCounted = (chain: ChainKey, ticker: string): boolean => {
  const validTickers: string[] = [
    TickerKey.DORITO,
    TickerKey.KWEEN,
    TickerKey.JUP,
    TickerKey.RENDER,
    TickerKey.SOL,
    TickerKey.USDC,
    TickerKey.USDT,
  ];

  switch (chain) {
    case ChainKey.NOBLE:
    case ChainKey.SOLANA:
      return validTickers.indexOf(ticker) >= 0;
    default:
      return true;
  }
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

export const calcReferralMultiplier = (referralCount: number) => {
  // Convert referralCount to float for math operations
  const rc = referralCount;

  // Compute numerator and denominator
  const numerator = Math.log(1 + rc);
  const denominator = Math.log(1 + 500);

  // Calculate multiplier
  let multiplier = 1 + numerator / denominator;

  // Apply MIN(2, multiplier)
  if (multiplier > 2) {
    multiplier = 2;
  }

  // Round down to 1 decimal place (floor rounding)
  return multiplier * 10 / 10;
};

export const calcSwapMultiplier = (swapVolume: number) => {
  // Calculate the multiplier
  let multiplier = 1 + 0.02 * Math.sqrt(swapVolume);

  // Round down to 1 decimal place (floor rounding)
  return multiplier * 10 / 10;
};

export const getCurrentSeason = (
  seasonInfo: SeasonInfo[]
): SeasonInfo | undefined => {
  const now = new Date();

  return (
    seasonInfo.find((season) => {
      const start = new Date(season.start);
      const end = new Date(season.end);

      return now >= start && now <= end;
    }) || undefined
  );
};

export const getCurrentSeasonVulties = (
  vault: VaultProps,
  seasonInfo: SeasonInfo[]
): number => {
  const currentSeasonId = parseInt(getCurrentSeason(seasonInfo)?.id || "0");

  return (
    vault.seasonStats?.find(
      (activity) => activity.seasonId == currentSeasonId
    )?.points || 0
  );
};

export const getActivity = (
  vault: VaultProps,
  seasonId: number
): Activities => {
  return (
    vault.seasonStats?.find((activity) => activity.seasonId == seasonId) || {
      seasonId: 0,
      rank: 0,
      points: 0,
    }
  );
};

export const handleSeasonPath = (path: string, id: string): string => {
  return path.replace(":id", id);
};
