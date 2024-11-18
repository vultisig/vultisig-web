import {
  ChainKey,
  Currency,
  Language,
  LayoutKey,
  Theme,
} from "utils/constants";

export interface AddressesProps {
  [publicKey: string]: { [chain: string]: string };
}

export interface ChainProps {
  address: string;
  balance: number;
  coins: CoinProps[];
  name: ChainKey;
  hexPublicKey: string;
  updated?: boolean;
}

export interface ChainBoolRef {
  [ChainKey.ARBITRUM]: boolean;
  [ChainKey.AVALANCHE]: boolean;
  [ChainKey.BASE]: boolean;
  [ChainKey.BITCOIN]: boolean;
  [ChainKey.BITCOINCASH]: boolean;
  [ChainKey.BLAST]: boolean;
  [ChainKey.BSCCHAIN]: boolean;
  [ChainKey.CRONOSCHAIN]: boolean;
  [ChainKey.DASH]: boolean;
  [ChainKey.DOGECOIN]: boolean;
  [ChainKey.DYDX]: boolean;
  [ChainKey.ETHEREUM]: boolean;
  [ChainKey.GAIACHAIN]: boolean;
  [ChainKey.KUJIRA]: boolean;
  [ChainKey.LITECOIN]: boolean;
  [ChainKey.MAYACHAIN]: boolean;
  [ChainKey.OPTIMISM]: boolean;
  [ChainKey.POLKADOT]: boolean;
  [ChainKey.POLYGON]: boolean;
  [ChainKey.SOLANA]: boolean;
  [ChainKey.SUI]: boolean;
  [ChainKey.THORCHAIN]: boolean;
  [ChainKey.TON]: boolean;
  [ChainKey.ZKSYNC]: boolean;
}

export interface ChainStrRef {
  [ChainKey.ARBITRUM]: string;
  [ChainKey.AVALANCHE]: string;
  [ChainKey.BASE]: string;
  [ChainKey.BITCOIN]: string;
  [ChainKey.BITCOINCASH]: string;
  [ChainKey.BLAST]: string;
  [ChainKey.BSCCHAIN]: string;
  [ChainKey.CRONOSCHAIN]: string;
  [ChainKey.DASH]: string;
  [ChainKey.DOGECOIN]: string;
  [ChainKey.DYDX]: string;
  [ChainKey.ETHEREUM]: string;
  [ChainKey.GAIACHAIN]: string;
  [ChainKey.KUJIRA]: string;
  [ChainKey.LITECOIN]: string;
  [ChainKey.MAYACHAIN]: string;
  [ChainKey.OPTIMISM]: string;
  [ChainKey.POLKADOT]: string;
  [ChainKey.POLYGON]: string;
  [ChainKey.SOLANA]: string;
  [ChainKey.SUI]: string;
  [ChainKey.THORCHAIN]: string;
  [ChainKey.TON]: string;
  [ChainKey.ZKSYNC]: string;
}

export interface CoinParams {
  address: string;
  chain: ChainKey;
  cmcId: number;
  contractAddress: string;
  decimals: number;
  hexPublicKey: string;
  isNative: boolean;
  logo: string;
  ticker: string;
}

export interface CoinProps {
  balance: number;
  cmcId: number;
  contractAddress: string;
  decimals: number;
  id: number;
  isNative: boolean;
  logo: string;
  ticker: string;
  value: number;
}

export interface CurrencyRef {
  [Currency.AUD]: string;
  [Currency.CAD]: string;
  [Currency.CNY]: string;
  [Currency.EUR]: string;
  [Currency.GBP]: string;
  [Currency.JPY]: string;
  [Currency.RUB]: string;
  [Currency.SEK]: string;
  [Currency.SGD]: string;
  [Currency.USD]: string;
}

export interface Customization {
  logo: string;
  theme: Theme;
}

export interface FileProps {
  data: string;
  name: string;
}

export interface LanguageRef {
  [Language.CROATIA]: string;
  [Language.DUTCH]: string;
  [Language.ENGLISH]: string;
  [Language.GERMAN]: string;
  [Language.ITALIAN]: string;
  [Language.PORTUGUESE]: string;
  [Language.RUSSIAN]: string;
  [Language.SPANISH]: string;
}

export interface NodeInfo {
  bondProviders: {
    providers: {
      bondAddress: string;
      bond: string;
    }[];
  };
}

export interface OneInchRef {
  [chain: string]: number;
}

export interface PositionProps {
  base?: {
    chain: ChainKey;
    price: number;
    tiker: string;
    tokenAddress: string;
    tokenAmount: string;
    reward?: number;
  };
  target?: {
    chain: ChainKey;
    price: number;
    tiker: string;
    tokenAddress: string;
    tokenAmount: string;
  };
}

export interface QRCodeProps {
  file: FileProps;
  vault: VaultProps;
}

export interface SharedSettings {
  hexChainCode?: string;
  logo: string;
  publicKeyEcdsa?: string;
  publicKeyEddsa?: string;
  theme: Theme;
  uid?: string;
}

export interface TokenProps {
  chain: ChainKey;
  cmcId: number;
  contractAddress: string;
  decimals: number;
  hexPublicKey: "ECDSA" | "EDDSA";
  isDefault: boolean;
  isLocally: boolean;
  isNative: boolean;
  logo: string;
  ticker: string;
}

export interface VaultProps {
  alias: string;
  balance: number;
  chains: ChainProps[];
  hexChainCode: string;
  isActive: boolean;
  joinAirdrop: boolean;
  logo: string;
  lpValue: number;
  name: string;
  positions: {
    mayaBond?: PositionProps[];
    mayaLiquidity?: PositionProps[];
    runeProvider?: PositionProps[];
    saverPosition?: PositionProps[];
    tgtStake?: PositionProps[];
    thorBond?: PositionProps[];
    thorLiquidity?: PositionProps[];
    wewePositions?: PositionProps[];
    updated?: boolean;
  };
  publicKeyEcdsa: string;
  publicKeyEddsa: string;
  rank: number;
  registeredAt: number;
  theme: Theme;
  totalPoints: number;
  uid: string;
}

export interface VaultOutletContext {
  getTokens: (chain: ChainProps) => Promise<void>;
  deleteVault: (vault: VaultProps) => void;
  prepareChain: (chain: ChainProps, vault?: VaultProps) => void;
  updateVault: (vault: VaultProps) => void;
  updatePositions: (vault: VaultProps) => void;
  toggleToken: (coin: TokenProps, vault: VaultProps) => Promise<void>;
  layout: LayoutKey;
  tokens: TokenProps[];
  vault: VaultProps;
  vaults: VaultProps[];
}
