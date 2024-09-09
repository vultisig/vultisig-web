import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Drawer, Input, List, Spin, Switch } from "antd";

import { useVaultContext } from "context/vault";
import { Chain, defTokens } from "utils/constants";
import { TokenProps } from "utils/interfaces";
import constantModals from "modals/constant-modals";
import useGoBack from "utils/custom-back";

import { SearchOutlined } from "icons";
import TokenImage from "components/token-image";

interface InitialState {
  loading: Chain | null;
  search: string;
  visible: boolean;
}

const Component: FC = () => {
  const initialState: InitialState = {
    loading: null,
    search: "",
    visible: false,
  };
  const [state, setState] = useState(initialState);
  const { loading, search, visible } = state;
  const { toggleCoin, vault } = useVaultContext();
  const { hash } = useLocation();
  const goBack = useGoBack();

  const handleSearch = (value: string): void => {
    setState((prevState) => ({ ...prevState, search: value.toLowerCase() }));
  };

  const handleToggle = (coin: TokenProps): void => {
    if (vault && loading === null) {
      setState((prevState) => ({ ...prevState, loading: coin.chain }));

      toggleCoin(coin, vault)
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          setState((prevState) => ({ ...prevState, loading: null }));
        });
    }
  };

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.CHOOSE_CHAIN}`: {
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
          allowClear
        />
      }
      closeIcon={false}
      open={visible}
      width={320}
    >
      {visible ? (
        <List
          dataSource={defTokens
            .filter(({ isNative }) => isNative)
            .filter(
              ({ chain }) =>
                chain.toLowerCase().indexOf(search.toLowerCase()) >= 0
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
                  avatar={<TokenImage alt={item.chain} />}
                  title={item.chain}
                  description={item.ticker}
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Spin className="center-spin" />
      )}
    </Drawer>
  );
};

export default Component;
