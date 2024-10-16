import { FC, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Drawer, Input, List, Spin, Switch } from "antd";

import { useVaultContext } from "context/vault";
import { ChainKey } from "utils/constants";
import { TokenProps } from "utils/interfaces";
import constantModals from "modals/constant-modals";
import useGoBack from "hooks/go-back";

import { SearchOutlined } from "icons";
import TokenImage from "components/token-image";

interface TokenListProps {
  onSelect: (coin: TokenProps) => void;
  loading: ChainKey | null;
  search: string;
  tokens: TokenProps[];
}

interface InitialState {
  loading: ChainKey | null;
  search: string;
  visible: boolean;
}

const TokenList: FC<TokenListProps> = ({
  onSelect,
  loading,
  search,
  tokens,
}) => {
  const { chainKey } = useParams();
  const { vault } = useVaultContext();

  return (
    <List
      loading={
        tokens.filter(
          ({ chain, isNative }) => !isNative && chain.toLowerCase() === chainKey
        ).length <= 0
      }
      dataSource={tokens.filter(({ isLocally, ticker }) =>
        search.length < 3
          ? isLocally
          : ticker.toLowerCase().indexOf(search) >= 0
      )}
      renderItem={(item) => {
        const checked = vault
          ? vault?.chains.findIndex(
              ({ coins, name }) =>
                name === item.chain &&
                coins.findIndex(({ ticker }) => ticker === item.ticker) >= 0
            ) >= 0
          : false;

        return (
          <List.Item
            key={item.chain}
            extra={
              <Switch
                checked={checked}
                loading={item.chain === loading}
                onClick={() => onSelect(item)}
              />
            }
          >
            <List.Item.Meta
              avatar={<TokenImage alt={item.ticker} url={item.logo} />}
              title={item.ticker}
              description={item.chain}
            />
          </List.Item>
        );
      }}
    />
  );
};

const Component: FC = () => {
  const initialState: InitialState = {
    loading: null,
    search: "",
    visible: false,
  };
  const [state, setState] = useState(initialState);
  const { loading, search, visible } = state;
  const { toggleToken, tokens, vault } = useVaultContext();
  const { hash } = useLocation();
  const { chainKey } = useParams();

  const goBack = useGoBack();

  const handleSearch = (value: string): void => {
    setState((prevState) => ({ ...prevState, search: value.toLowerCase() }));
  };

  const handleToggle = (coin: TokenProps): void => {
    if (vault && loading === null) {
      setState((prevState) => ({ ...prevState, loading: coin.chain }));

      toggleToken(coin, vault)
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          setState((prevState) => ({ ...prevState, loading: null }));
        });
    }
  };

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.CHOOSE_TOKEN}`: {
        setState((prevState) => ({ ...prevState, visible: true }));

        break;
      }
      default: {
        setState(initialState);

        break;
      }
    }
  };

  useEffect(componentDidUpdate, [hash]);

  return (
    <Drawer
      footer={false}
      onClose={() => goBack()}
      title={
        <Input
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          prefix={<SearchOutlined />}
          value={search}
        />
      }
      closeIcon={false}
      open={visible}
      width={320}
    >
      {visible ? (
        <TokenList
          onSelect={handleToggle}
          search={search}
          loading={loading}
          tokens={[
            ...(vault?.chains
              .filter(({ name }) => name.toLowerCase() === chainKey)
              .flatMap(({ coins, name }) => {
                const modifiedCoins: TokenProps[] = coins.map((coin) => ({
                  chain: name,
                  cmcId: coin.cmcId,
                  contractAddress: coin.contractAddress,
                  decimals: coin.decimals,
                  hexPublicKey: "ECDSA",
                  isDefault: false,
                  isLocally: true,
                  isNative: coin.isNative,
                  logo: coin.logo,
                  ticker: coin.ticker,
                }));

                return modifiedCoins;
              }).filter(({ isNative }) => !isNative) ?? []),
            ...tokens
              .filter(
                ({ chain, isNative }) =>
                  !isNative && chain.toLowerCase() === chainKey
              )
              .filter(
                ({ ticker }) =>
                  !vault?.chains.find(
                    ({ name, coins }) =>
                      name.toLowerCase() === chainKey &&
                      coins.findIndex(({ ticker: t }) => t === ticker) >= 0
                  )
              ),
          ]}
        />
      ) : (
        <Spin className="center-spin" />
      )}
    </Drawer>
  );
};

export default Component;
