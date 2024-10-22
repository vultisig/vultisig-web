import keyMirror from "keymirror";

import {
  ChainBoolRef,
  ChainStrRef,
  CurrencyRef,
  LanguageRef,
  OneInchRef,
  TokenProps,
} from "utils/interfaces";

export enum ChainKey {
  ARBITRUM = "Arbitrum",
  AVALANCHE = "Avalanche",
  BASE = "Base",
  BITCOIN = "Bitcoin",
  BITCOINCASH = "BitcoinCash",
  BLAST = "Blast",
  BSCCHAIN = "BSC",
  CRONOSCHAIN = "CronosChain",
  DASH = "Dash",
  DOGECOIN = "Dogecoin",
  DYDX = "Dydx",
  ETHEREUM = "Ethereum",
  GAIACHAIN = "Cosmos",
  KUJIRA = "Kujira",
  LITECOIN = "Litecoin",
  MAYACHAIN = "MayaChain",
  OPTIMISM = "Optimism",
  POLKADOT = "Polkadot",
  POLYGON = "Polygon",
  SOLANA = "Solana",
  SUI = "Sui",
  THORCHAIN = "THORChain",
  ZKSYNC = "Zksync",
}

export enum LayoutKey {
  SHARED,
  VAULT,
}

export enum MayaChainKey {
  ARB = "Arbitrum",
  BTC = "Bitcoin",
  BSC = "BSC",
  DASH = "Dash",
  ETH = "Ethereum",
  KUJI = "Kujira",
  THOR = "THORChain",
  MAYACHAIN = "MayaChain",
}

export enum PageKey {
  ASSETS,
  CHAINS,
  IMPORT,
  LEADERBOARD,
  POSITIONS,
  SHARED_ASSETS,
  SHARED_CHAINS,
  SHARED_POSITIONS,
  UPLOAD,
}

export enum TCChainKey {
  AVAX = "Avalanche",
  BTC = "Bitcoin",
  BCH = "BitcoinCash",
  BSC = "BSC",
  DOGE = "Dogecoin",
  ETH = "Ethereum",
  GAIA = "Cosmos",
  LTC = "Litecoin",
  THOR = "THORChain",
}

export interface PositionInfo {
  base?: {
    baseTokenAddress: string;
    baseChain: string;
    baseTiker: string;
    basePriceUsd: number;
    baseTokenAmount: number;
    reward?: number;
  };
  target?: {
    targetTokenAddress: string;
    targetChain: string;
    targetTiker: string;
    targetPriceUsd: number;
    targetTokenAmount: number;
  };
}

export enum Currency {
  AUD = "AUD",
  CAD = "CAD",
  CNY = "CNY",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  RUB = "RUB",
  SEK = "SEK",
  SGD = "SGD",
  USD = "USD",
}

export enum Language {
  CROATIA = "hr",
  DUTCH = "nl",
  ENGLISH = "en",
  GERMAN = "de",
  ITALIAN = "it",
  RUSSIAN = "ru",
  PORTUGUESE = "pt",
  SPANISH = "es",
}

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
  VULTISIG = "vulti",
}

export const errorKey = keyMirror({
  ADDRESS_NOT_MATCH: true,
  FAIL_TO_ADD_COIN: true,
  FAIL_TO_DELETE_COIN: true,
  FAIL_TO_DELETE_VAULT: true,
  FAIL_TO_DERIVE_PUBLIC_KEY: true,
  FAIL_TO_EXIT_REGISTRY: true,
  FAIL_TO_GET_COIN: true,
  FAIL_TO_GET_ADDRESS: true,
  FAIL_TO_GET_VAULT: true,
  FAIL_TO_INIT_WASM: true,
  FAIL_TO_JOIN_REGISTRY: true,
  FAIL_TO_REGISTER_VAULT: true,
  FORBIDDEN_ACCESS: true,
  INVALID_EXTENSION: true,
  INVALID_FILE: true,
  INVALID_QRCODE: true,
  INVALID_REQUEST: true,
  INVALID_TOKEN: true,
  INVALID_VAULT: true,
  LOGO_TOO_LARGE: true,
  VAULT_ALREADY_REGISTERED: true,
  VAULT_NOT_FOUND: true,
  UNKNOWN_ERROR: true,
});

export const balanceAPI: ChainStrRef = {
  [ChainKey.ARBITRUM]: "https://arbitrum-one-rpc.publicnode.com",
  [ChainKey.AVALANCHE]: "https://avalanche-c-chain-rpc.publicnode.com",
  [ChainKey.BASE]: "https://base-rpc.publicnode.com",
  [ChainKey.BITCOIN]:
    "https://api.vultisig.com/blockchair/bitcoin/dashboards/address", //$address?state=latest
  [ChainKey.BITCOINCASH]:
    "https://api.vultisig.com/blockchair/bitcoin-cash/dashboards/address", //$address?state=latest
  [ChainKey.BLAST]: "https://rpc.ankr.com/blast",
  [ChainKey.BSCCHAIN]: "https://bsc-rpc.publicnode.com",
  [ChainKey.CRONOSCHAIN]: "https://cronos-evm-rpc.publicnode.com",
  [ChainKey.DASH]:
    "https://api.vultisig.com/blockchair/dash/dashboards/address", //$address?state=latest
  [ChainKey.DOGECOIN]:
    "https://api.vultisig.com/blockchair/dogecoin/dashboards/address", //$address?state=latest
  [ChainKey.DYDX]:
    "https://dydx-rest.publicnode.com/cosmos/bank/v1beta1/balances", //$address
  [ChainKey.ETHEREUM]: "https://ethereum-rpc.publicnode.com",
  [ChainKey.GAIACHAIN]:
    "https://cosmos-rest.publicnode.com/cosmos/bank/v1beta1/balances", //$address
  [ChainKey.KUJIRA]:
    "https://kujira-rest.publicnode.com/cosmos/bank/v1beta1/balances", //$address
  [ChainKey.LITECOIN]:
    "https://api.vultisig.com/blockchair/litecoin/dashboards/address", //$address?state=latest
  [ChainKey.MAYACHAIN]:
    "https://mayanode.mayachain.info/cosmos/bank/v1beta1/balances", //$address
  [ChainKey.OPTIMISM]: "https://optimism-rpc.publicnode.com",
  [ChainKey.POLKADOT]: "https://polkadot.api.subscan.io/api/v2/scan/search",
  [ChainKey.POLYGON]: "https://polygon-bor-rpc.publicnode.com",
  [ChainKey.SOLANA]: "https://solana-rpc.publicnode.com",
  [ChainKey.SUI]: "https://suiscan.xyz/mainnet/address", //$address
  [ChainKey.THORCHAIN]:
    "https://thornode.ninerealms.com/cosmos/bank/v1beta1/balances", //$address
  [ChainKey.ZKSYNC]: "https://explorer.zksync.io/address", //$address
};

export const chooseToken: ChainBoolRef = {
  [ChainKey.ARBITRUM]: true,
  [ChainKey.AVALANCHE]: true,
  [ChainKey.BASE]: true,
  [ChainKey.BITCOIN]: false,
  [ChainKey.BITCOINCASH]: false,
  [ChainKey.BLAST]: true,
  [ChainKey.BSCCHAIN]: true,
  [ChainKey.CRONOSCHAIN]: true,
  [ChainKey.DASH]: false,
  [ChainKey.DOGECOIN]: false,
  [ChainKey.DYDX]: false,
  [ChainKey.ETHEREUM]: true,
  [ChainKey.GAIACHAIN]: false,
  [ChainKey.KUJIRA]: false,
  [ChainKey.LITECOIN]: false,
  [ChainKey.MAYACHAIN]: true,
  [ChainKey.OPTIMISM]: true,
  [ChainKey.POLKADOT]: false,
  [ChainKey.POLYGON]: true,
  [ChainKey.SOLANA]: true,
  [ChainKey.SUI]: false,
  [ChainKey.THORCHAIN]: false,
  [ChainKey.ZKSYNC]: false,
};

export const exploreToken: ChainStrRef = {
  [ChainKey.ARBITRUM]: "https://arbiscan.io/address/",
  [ChainKey.AVALANCHE]: "https://snowtrace.io/address/",
  [ChainKey.BASE]: "https://basescan.org/address/",
  [ChainKey.BITCOIN]: "https://blockchair.com/bitcoin/address/",
  [ChainKey.BITCOINCASH]: "https://blockchair.com/bitcoin-cash/address/",
  [ChainKey.BLAST]: "https://blastscan.io/address/",
  [ChainKey.BSCCHAIN]: "https://bscscan.com/address/",
  [ChainKey.CRONOSCHAIN]: "https://cronoscan.com/address/",
  [ChainKey.DASH]: "https://blockchair.com/dash/address/",
  [ChainKey.DOGECOIN]: "https://blockchair.com/dogecoin/address/",
  [ChainKey.DYDX]: "https://www.mintscan.io/dydx/address/",
  [ChainKey.ETHEREUM]: "https://etherscan.io/address/",
  [ChainKey.GAIACHAIN]: "https://www.mintscan.io/cosmos/address/",
  [ChainKey.KUJIRA]: "https://finder.kujira.network/kaiyo-1/address/",
  [ChainKey.LITECOIN]: "https://blockchair.com/litecoin/address/",
  [ChainKey.MAYACHAIN]: "https://www.mayascan.org/address/",
  [ChainKey.OPTIMISM]: "https://optimistic.etherscan.io/address/",
  [ChainKey.POLKADOT]: "https://polkadot.subscan.io/account/",
  [ChainKey.POLYGON]: "https://polygonscan.com/address/",
  [ChainKey.SOLANA]: "https://explorer.solana.com/address/",
  [ChainKey.SUI]: "https://suiscan.xyz/mainnet/address/",
  [ChainKey.THORCHAIN]: "https://thorchain.net/address/",
  [ChainKey.ZKSYNC]: "https://explorer.zksync.io/address/",
};

export const currencyName: CurrencyRef = {
  [Currency.AUD]: "Australian Dollar",
  [Currency.CAD]: "Canadian Dollar",
  [Currency.CNY]: "Chinese Yuan",
  [Currency.EUR]: "European Euro",
  [Currency.GBP]: "British Pound",
  [Currency.JPY]: "Japanese Yen",
  [Currency.RUB]: "Russian Ruble",
  [Currency.SEK]: "Swedish Krona",
  [Currency.SGD]: "Singapore Dollar",
  [Currency.USD]: "United States Dollar",
};

export const currencySymbol: CurrencyRef = {
  [Currency.AUD]: "A$",
  [Currency.CAD]: "C$",
  [Currency.CNY]: "¥",
  [Currency.EUR]: "€",
  [Currency.GBP]: "£",
  [Currency.JPY]: "¥",
  [Currency.RUB]: "₽",
  [Currency.SEK]: "kr",
  [Currency.SGD]: "S$",
  [Currency.USD]: "$",
};

export const languageName: LanguageRef = {
  [Language.CROATIA]: "Hrvatski",
  [Language.DUTCH]: "Dutch",
  [Language.ENGLISH]: "English",
  [Language.GERMAN]: "Deutsch",
  [Language.ITALIAN]: "Italiano",
  [Language.PORTUGUESE]: "Português",
  [Language.RUSSIAN]: "Русский",
  [Language.SPANISH]: "Espanol",
};

export const oneInchRef: OneInchRef = {
  [ChainKey.ARBITRUM]: 1,
  [ChainKey.AVALANCHE]: 43114,
  [ChainKey.BASE]: 8453,
  [ChainKey.BLAST]: 81457,
  [ChainKey.BSCCHAIN]: 56,
  [ChainKey.CRONOSCHAIN]: 25,
  [ChainKey.ETHEREUM]: 1,
  [ChainKey.OPTIMISM]: 10,
  [ChainKey.POLYGON]: 137,
};

export const defTokens: TokenProps[] = [
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 1027,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "ETH",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 5805,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "AVAX",
  },
  {
    chain: ChainKey.BASE,
    cmcId: 1027,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "ETH",
  },
  {
    chain: ChainKey.BITCOIN,
    cmcId: 1,
    contractAddress: "",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: true,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "BTC",
  },
  {
    chain: ChainKey.BITCOINCASH,
    cmcId: 1831,
    contractAddress: "",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "BCH",
  },
  {
    chain: ChainKey.BLAST,
    cmcId: 1027,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "ETH",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 1839,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: true,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "BNB",
  },
  {
    chain: ChainKey.CRONOSCHAIN,
    cmcId: 3635,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "CRO",
  },
  {
    chain: ChainKey.DOGECOIN,
    cmcId: 74,
    contractAddress: "",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "DOGE",
  },
  {
    chain: ChainKey.DYDX,
    cmcId: 28324,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "DYDX",
  },
  {
    chain: ChainKey.DASH,
    cmcId: 131,
    contractAddress: "",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "DASH",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 1027,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: true,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "ETH",
  },
  {
    chain: ChainKey.GAIACHAIN,
    cmcId: 3794,
    contractAddress: "",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "ATOM",
  },
  {
    chain: ChainKey.KUJIRA,
    cmcId: 15185,
    contractAddress: "",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "KUJI",
  },
  {
    chain: ChainKey.LITECOIN,
    cmcId: 2,
    contractAddress: "",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "LTC",
  },
  {
    chain: ChainKey.MAYACHAIN,
    cmcId: 0,
    contractAddress: "",
    decimals: 10,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "CACAO",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 1027,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "ETH",
  },
  {
    chain: ChainKey.POLKADOT,
    cmcId: 6636,
    contractAddress: "",
    decimals: 10,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "DOT",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 3890,
    contractAddress: "",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "MATIC",
  },
  {
    chain: ChainKey.SOLANA,
    cmcId: 5426,
    contractAddress: "",
    decimals: 9,
    hexPublicKey: "EDDSA",
    isDefault: true,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "SOL",
  },
  {
    chain: ChainKey.THORCHAIN,
    cmcId: 4157,
    contractAddress: "",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: true,
    isLocally: true,
    isNative: true,
    logo: "",
    ticker: "RUNE",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 11841,
    contractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "ARB",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 16049,
    contractAddress: "0x429fEd88f10285E61b12BDF00848315fbDfCC341",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "TGT",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 32121,
    contractAddress: "0xf929de51D91C77E42f5090069E0AD7A09e513c73",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "FOX",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 825,
    contractAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDT",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 18852,
    contractAddress: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC.e",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 3408,
    contractAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 3717,
    contractAddress: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WBTC",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 1975,
    contractAddress: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "LINK",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 4943,
    contractAddress: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "DAI",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 7083,
    contractAddress: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "UNI",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 6719,
    contractAddress: "0x9623063377AD1B27544C965cCd7342f7EA7e88C7",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "GRT",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 29520,
    contractAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "ezETH",
  },
  {
    chain: ChainKey.ARBITRUM,
    cmcId: 8000,
    contractAddress: "0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "LDO",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 3408,
    contractAddress: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 825,
    contractAddress: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDT",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 20721,
    contractAddress: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "BTC.b",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 18523,
    contractAddress: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "sAVAX",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 11396,
    contractAddress: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "JOE",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 8422,
    contractAddress: "0x60781C2586D68229fde47564546784ab3fACA982",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "PNG",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 9462,
    contractAddress: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WAVAX",
  },
  {
    chain: ChainKey.AVALANCHE,
    cmcId: 31629,
    contractAddress: "0x46B9144771Cb3195D66e4EDA643a7493fADCAF9D",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "BLS",
  },
  {
    chain: ChainKey.BASE,
    cmcId: 32343,
    contractAddress: "0x6b9bb36519538e0C073894E964E90172E1c0B41F",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WEWE",
  },
  {
    chain: ChainKey.BASE,
    cmcId: 3408,
    contractAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC",
  },
  {
    chain: ChainKey.BASE,
    cmcId: 4943,
    contractAddress: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "DAI",
  },
  {
    chain: ChainKey.BASE,
    cmcId: 29520,
    contractAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "ezETH",
  },
  {
    chain: ChainKey.BASE,
    cmcId: 29587,
    contractAddress: "0xB0fFa8000886e57F86dd5264b9582b2Ad87b2b91",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "W",
  },
  {
    chain: ChainKey.BASE,
    cmcId: 21535,
    contractAddress: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "cbETH",
  },
  {
    chain: ChainKey.BASE,
    cmcId: 2586,
    contractAddress: "0x22e6966B799c4D5B13BE962E1D117b56327FDa66",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "SNX",
  },
  {
    chain: ChainKey.BLAST,
    cmcId: 2396,
    contractAddress: "0x4300000000000000000000000000000000000004",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WETH",
  },
  {
    chain: ChainKey.BLAST,
    cmcId: 3717,
    contractAddress: "0xF7bc58b8D8f97ADC129cfC4c9f45Ce3C0E1D2692",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WBTC",
  },
  {
    chain: ChainKey.BLAST,
    cmcId: 29599,
    contractAddress: "0x4300000000000000000000000000000000000003",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDB",
  },
  {
    chain: ChainKey.BLAST,
    cmcId: 28480,
    contractAddress: "0xb1a5700fA2358173Fe465e6eA4Ff52E36e88E2ad",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "BLAST",
  },
  {
    chain: ChainKey.BLAST,
    cmcId: 28827,
    contractAddress: "0x9e20461bc2c4c980f62f1B279D71734207a6A356",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "OMNI",
  },
  {
    chain: ChainKey.BLAST,
    cmcId: 26979,
    contractAddress: "0x47C337Bd5b9344a6F3D6f58C474D9D8cd419D8cA",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "DACKIE",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 825,
    contractAddress: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDT",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 3408,
    contractAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 4943,
    contractAddress: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "DAI",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 2396,
    contractAddress: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WETH",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 7278,
    contractAddress: "0xfb6115445bff7b52feb98650c87f44907e58f802",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "AAVE",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 5692,
    contractAddress: "0x52ce071bd9b1c4b00a0b92d298c512478cad67e8",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "COMP",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 6758,
    contractAddress: "0x947950bcc74888a40ffa2593c5798f11fc9124c4",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "SUSHI",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 9444,
    contractAddress: "0xfe56d5892bdffc7bf58f2e84be1b2c32d21c308b",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "KNC",
  },
  {
    chain: ChainKey.BSCCHAIN,
    cmcId: 24478,
    contractAddress: "0x25d887ce7a35172c62febfd67a1856f20faebb00",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "PEPE",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 3408,
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 825,
    contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDT",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 7083,
    contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "UNI",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 3890,
    contractAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "MATIC",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 3717,
    contractAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WBTC",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 1975,
    contractAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "LINK",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 13268,
    contractAddress: "0x826180541412d574cf1336d22c0c0a287822678a",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "FLIP",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 16049,
    contractAddress: "0x108a850856Db3f85d0269a2693D896B394C80325",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "TGT",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 32121,
    contractAddress: "0xc770eefad204b5180df6a14ee197d99d808ee52d",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "FOX",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 4943,
    contractAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "DAI",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 2396,
    contractAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WETH",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 5864,
    contractAddress: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "YFI",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 7278,
    contractAddress: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "AAVE",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 5692,
    contractAddress: "0xc00e94cb662c3520282e6f5717214004a7f26888",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "COMP",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 1697,
    contractAddress: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "BAT",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 2586,
    contractAddress: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "SNX",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 5728,
    contractAddress: "0xba100000625a3754423978a60c9317c58a424e3d",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "BAL",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 6758,
    contractAddress: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "SUSHI",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 1518,
    contractAddress: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "MKR",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 9444,
    contractAddress: "0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "KNC",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 6719,
    contractAddress: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "GRT",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 24478,
    contractAddress: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "PEPE",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 0,
    contractAddress: "0x815C23eCA83261b6Ec689b60Cc4a58b54BC24D8D",
    decimals: 18,
    hexPublicKey: "ECDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "vTHOR",
  },
  {
    chain: ChainKey.ETHEREUM,
    cmcId: 12942,
    contractAddress: "0xa5f2211B9b8170F694421f2046281775E8468044",
    decimals: 18,
    hexPublicKey: "ECDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "THOR",
  },
  {
    chain: ChainKey.MAYACHAIN,
    cmcId: 0,
    contractAddress: "",
    decimals: 4,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "MAYA",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 11840,
    contractAddress: "0x4200000000000000000000000000000000000042",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "OP",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 32121,
    contractAddress: "0xf1a0da3367bc7aa04f8d94ba57b862ff37ced174",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "FOX",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 825,
    contractAddress: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDT",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 3408,
    contractAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 18852,
    contractAddress: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC.e",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 3717,
    contractAddress: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WBTC",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 1975,
    contractAddress: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "LINK",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 4943,
    contractAddress: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "DAI",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 29520,
    contractAddress: "0x2416092f143378750bb29b79eD961ab195CcEea5",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "ezETH",
  },
  {
    chain: ChainKey.OPTIMISM,
    cmcId: 8000,
    contractAddress: "0xFdb794692724153d1488CcdBE0C56c252596735F",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "LDO",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 2396,
    contractAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WETH",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 32121,
    contractAddress: "0x65a05db8322701724c197af82c9cae41195b0aa8",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "FOX",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 825,
    contractAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDT",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 1839,
    contractAddress: "0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "BNB",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 5426,
    contractAddress: "0xd93f7E271cB87c23AaA73edC008A79646d1F9912",
    decimals: 9,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "SOL",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 3408,
    contractAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 18852,
    contractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    decimals: 6,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "USDC.e",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 3717,
    contractAddress: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    decimals: 8,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "WBTC",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 5805,
    contractAddress: "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "AVAX",
  },
  {
    chain: ChainKey.POLYGON,
    cmcId: 1975,
    contractAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
    decimals: 18,
    hexPublicKey: "EDDSA",
    isDefault: false,
    isLocally: true,
    isNative: false,
    logo: "",
    ticker: "LINK",
  },
];
