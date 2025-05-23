import { ChainKey, CollectionKey, LayoutKey, Theme } from "utils/constants";

export interface AddressesProps {
  [publicKey: string]: { [chain: string]: string };
}

export interface ChainProps {
  address: string;
  balance: number;
  coins: CoinProps[];
  coinsUpdated?: boolean;
  name: ChainKey;
  nfts: NFTProps[];
  nftsBalance?: number;
  nftsUpdated?: boolean;
  hexPublicKey: string;
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

export interface Customization {
  logo: string;
  theme: Theme;
}

export interface FileProps {
  data: string;
  name: string;
}

export interface NFTProps {
  collection: CollectionKey;
  identifier: number;
}

export interface NodeInfo {
  bondProviders: {
    providers: {
      bondAddress: string;
      bond: string;
    }[];
  };
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
  assetsUpdating?: boolean;
  avatarUrl: string;
  balance: number;
  chains: ChainProps[];
  hexChainCode: string;
  isActive: boolean;
  joinAirdrop: boolean;
  logo: string;
  lpValue: number;
  name: string;
  nftValue: number;
  nftsUpdating?: boolean;
  positions: {
    mayaBond?: PositionProps[];
    mayaLiquidity?: PositionProps[];
    runeProvider?: PositionProps[];
    saverPosition?: PositionProps[];
    tgtStake?: PositionProps[];
    thorBond?: PositionProps[];
    thorLiquidity?: PositionProps[];
    updated?: boolean;
  };
  positionsUpdating?: boolean;
  publicKeyEcdsa: string;
  publicKeyEddsa: string;
  rank: number;
  swapVolumeRank: number;
  registeredAt: number;
  referralCode: string;
  referralCount: number;
  showNameInLeaderboard: boolean;
  swapVolume: number;
  theme: Theme;
  //totalPoints: number;
  uid: string;
  seasonStats: Activities[];
}

export interface Activities {
  seasonId: number;
  rank: number;
  points: number;
}

export interface SeasonInfo {
  id: string;
  start: string;
  end: string;
  milestones: number[];
  nfts: NFT[];
  tokens: Token[];
}

interface NFT {
  multiplier: number;
  collectionName: string;
  chain: string;
  contractAddress: string;
}

interface Token {
  multiplier: number;
  name: string;
  minAmount: number;
  chain: string;
  contractAddress: string;
}

export interface VaultOutletContext {
  getTokens: (chain: ChainProps) => Promise<void>;
  deleteVault: (vault: VaultProps) => void;
  prepareChain: (chain: ChainProps, vault: VaultProps) => void;
  prepareNFT: (chain: ChainProps, vault: VaultProps) => void;
  updateVault: (vault: VaultProps) => void;
  updatePositions: (vault: VaultProps) => void;
  toggleToken: (coin: TokenProps, vault: VaultProps) => Promise<void>;
  layout: LayoutKey;
  tokens: TokenProps[];
  vault: VaultProps;
  vaults: VaultProps[];
}
