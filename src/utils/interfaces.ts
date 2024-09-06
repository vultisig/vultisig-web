import type { CoinType } from "@trustwallet/wallet-core/dist/src/wallet-core";

import { Chain, Currency, Language } from "utils/constants";

export namespace Balance {
  export namespace Cosmos {
    export interface Props {
      balances: {
        denom: string;
        amount: string;
      }[];
    }
  }

  export namespace EVM {
    export interface Params {
      jsonrpc: string;
      method: string;
      params: [string | { to: string; data: string }, string];
      id: string;
    }

    export interface Props {
      id: number;
      jsonrpc: string;
      result: string;
    }
  }

  export namespace Polkadot {
    export interface Params {
      key: string;
    }

    export interface Props {
      data: { account: { balance: string } };
    }
  }

  export namespace Solana {
    export interface Params {
      jsonrpc: string;
      method: string;
      params: [string] | [string, { mint: string }, { encoding: string }];
      id: string;
    }

    export interface Props {
      id: number;
      jsonrpc: string;
      result: { value: number };
    }
  }

  export namespace UTXO {
    export interface Props {
      data: { [address: string]: { address: { balance: number } } };
    }
  }
}

export namespace CMC {
  export interface ID {
    data: { [cmcId: string]: { id: number } };
  }

  export interface Value {
    data: {
      [id: string]: { quote: { [currency: string]: { price: number } } };
    };
  }
}

export namespace Derivation {
  export interface Params {
    publicKeyEcdsa: string;
    hexChainCode: string;
    derivePath: string;
  }

  export interface Props {
    publicKey: string;
  }
}

export interface ChainProps {
  address: string;
  name: Chain;
  coins: CoinProps[];
  hexPublicKey: string;
}

export interface ChainBoolRef {
  [Chain.ARBITRUM]: boolean;
  [Chain.AVALANCHE]: boolean;
  [Chain.BASE]: boolean;
  [Chain.BITCOIN]: boolean;
  [Chain.BITCOINCASH]: boolean;
  [Chain.BLAST]: boolean;
  [Chain.BSCCHAIN]: boolean;
  [Chain.CRONOSCHAIN]: boolean;
  [Chain.DASH]: boolean;
  [Chain.DOGECOIN]: boolean;
  [Chain.DYDX]: boolean;
  [Chain.ETHEREUM]: boolean;
  [Chain.GAIACHAIN]: boolean;
  [Chain.KUJIRA]: boolean;
  [Chain.LITECOIN]: boolean;
  [Chain.MAYACHAIN]: boolean;
  [Chain.OPTIMISM]: boolean;
  [Chain.POLKADOT]: boolean;
  [Chain.POLYGON]: boolean;
  [Chain.SOLANA]: boolean;
  [Chain.SUI]: boolean;
  [Chain.THORCHAIN]: boolean;
  [Chain.ZKSYNC]: boolean;
}

export interface ChainStrRef {
  [Chain.ARBITRUM]: string;
  [Chain.AVALANCHE]: string;
  [Chain.BASE]: string;
  [Chain.BITCOIN]: string;
  [Chain.BITCOINCASH]: string;
  [Chain.BLAST]: string;
  [Chain.BSCCHAIN]: string;
  [Chain.CRONOSCHAIN]: string;
  [Chain.DASH]: string;
  [Chain.DOGECOIN]: string;
  [Chain.DYDX]: string;
  [Chain.ETHEREUM]: string;
  [Chain.GAIACHAIN]: string;
  [Chain.KUJIRA]: string;
  [Chain.LITECOIN]: string;
  [Chain.MAYACHAIN]: string;
  [Chain.OPTIMISM]: string;
  [Chain.POLKADOT]: string;
  [Chain.POLYGON]: string;
  [Chain.SOLANA]: string;
  [Chain.SUI]: string;
  [Chain.THORCHAIN]: string;
  [Chain.ZKSYNC]: string;
}

export interface CoinParams {
  address: string;
  chain: Chain;
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

export interface CoinRef {
  [chain: string]: CoinType;
}

export interface CurrencyRef {
  [Currency.AUD]: string;
  [Currency.CAD]: string;
  [Currency.CNY]: string;
  [Currency.EUR]: string;
  [Currency.GPB]: string;
  [Currency.JPY]: string;
  [Currency.RUB]: string;
  [Currency.SEK]: string;
  [Currency.SGD]: string;
  [Currency.USD]: string;
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

export interface OneInchRef {
  [chain: string]: number;
}

export interface FileProps {
  data: string;
  name: string;
}

export interface QRCodeProps {
  file: FileProps;
  vault: VaultProps;
}

export interface TokenProps {
  chain: Chain;
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
  chains: ChainProps[];
  hexChainCode: string;
  joinAirdrop: boolean;
  name: string;
  publicKeyEcdsa: string;
  publicKeyEddsa: string;
  totalPoints: number;
  uid: string;
}
