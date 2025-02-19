import { FC, useEffect, useState } from "react";
import { useLocation, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Drawer, Input, List, Switch } from "antd";

import { ChainKey } from "utils/constants";
import { TokenProps, VaultOutletContext } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import useGoBack from "hooks/go-back";

import { Search } from "icons";
import TokenImage from "components/token-image";

interface InitialState {
  loading: ChainKey | null;
  search: string;
  visible: boolean;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    loading: null,
    search: "",
    visible: false,
  };
  const [state, setState] = useState(initialState);
  const { loading, search, visible } = state;
  const { toggleToken, tokens, vault } = useOutletContext<VaultOutletContext>();
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

  const modifiedTokens: TokenProps[] = [
    ...(vault?.chains
      .filter(({ name }) => name.toLowerCase() === chainKey)
      .flatMap(({ coins, name }) => {
        const modifiedCoins: TokenProps[] = coins
          .filter(({ isNative }) => !isNative)
          .map((coin) => ({
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
      }) || []),
    ...tokens
      .filter(
        ({ chain, isNative }) => !isNative && chain.toLowerCase() === chainKey
      )
      .filter(
        ({ ticker }) =>
          !vault?.chains.find(
            ({ name, coins }) =>
              name.toLowerCase() === chainKey &&
              coins.findIndex(({ ticker: t }) => t === ticker) >= 0
          )
      ),
  ];

  return (
    <Drawer
      footer={false}
      onClose={() => goBack()}
      title={
        <Input
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={`${t(constantKeys.SEARCH)}...`}
          prefix={<Search />}
          value={search}
        />
      }
      closeIcon={false}
      open={visible}
      width={320}
    >
      <List
        loading={
          modifiedTokens.length > 0 &&
          modifiedTokens.filter(
            ({ chain, isNative }) =>
              !isNative && chain.toLowerCase() === chainKey
          ).length <= 0
        }
        dataSource={modifiedTokens.filter(({ isLocally, ticker }) =>
          search.length < 2
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
                  onClick={() => handleToggle(item)}
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
    </Drawer>
  );
};

export default Component;
