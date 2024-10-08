import { FC, useEffect, useState } from "react";
import { Dropdown, MenuProps } from "antd";

import { useVaultContext } from "context/vault";
import { VaultProps } from "utils/interfaces";

import VultiLoading from "components/vulti-loading";

interface InitialState {
  vault?: VaultProps;
}

const Component: FC = () => {
  const initialState: InitialState = {};
  const [state, setState] = useState(initialState);
  const { vault } = state;
  const { vaults } = useVaultContext();

  const items: MenuProps["items"] = [
    ...vaults.map((vault) => ({
      label: vault.alias,
      key: vault.uid,
      onClick: () => setState((prevState) => ({ ...prevState, vault })),
    })),
  ];

  const componentDidMount = (): void => {
    const [vault] = vaults;

    setState((prevState) => ({ ...prevState, vault }));
  };

  useEffect(componentDidMount, []);

  return vault ? (
    <div className="layout-content leaderboard-page">
      <div className="breadcrumb">
        <Dropdown menu={{ items }} className="menu">
          <span className="vault">{vault.alias}</span>
        </Dropdown>

        <div className="result">
          <div className="item point">
            <span className="label">FARMED</span>
            <span className="value">25 points</span>
          </div>

          <div className="item divider" />

          <div className="item rank">
            <img src="/ranks/basic.svg" className="icon" />
            <span className="label">YOUR POSITION</span>
            <span className="value">10,500 / 166,234</span>
          </div>
        </div>
      </div>
      <div className="board">
        <div className="list top">
          <div className="item">
            <img src="/ranks/gold.svg" className="icon" />
            <div className="point">
              <span className="avatar" />
              <span className="name">JP.THOR</span>
              <span className="value">1,902 points</span>
            </div>
            <div className="rank">
              <span className="value">#1</span>
              <span className="price">$802,899.23</span>
            </div>
          </div>
          <div className="item">
            <img src="/ranks/silver.svg" className="icon" />
            <div className="point">
              <span className="avatar" />
              <span className="name">paaao</span>
              <span className="value">1,702 points</span>
            </div>
            <div className="rank">
              <span className="value">#2</span>
              <span className="price">$602,899.23</span>
            </div>
          </div>
          <div className="item">
            <img src="/ranks/bronze.svg" className="icon" />
            <div className="point">
              <span className="avatar" />
              <span className="name">blonded bull</span>
              <span className="value">1,502 points</span>
            </div>
            <div className="rank">
              <span className="value">#3</span>
              <span className="price">$402,899.23</span>
            </div>
          </div>
        </div>
        <div className="list">
          <div className="item">
            <div className="point">
              <span className="avatar" />
              <span className="name">Vault Name</span>
              <span className="value">1,000 points</span>
            </div>
            <div className="rank">
              <span className="value">#4</span>
              <span className="price">$1,000.00</span>
            </div>
          </div>
          <div className="item divider">
            <div className="stats">
              <span className="numb">+ 10,445 others</span>
              <span className="more">show all</span>
            </div>
          </div>
          <div className="item active">
            <div className="point">
              <span className="avatar" />
              <span className="name">Vault Name (YOU)</span>
              <span className="value">1,000 points</span>
            </div>
            <div className="rank">
              <span className="value">#5</span>
              <span className="price">$1,000.00</span>
            </div>
          </div>
          <div className="item">
            <div className="point">
              <span className="avatar" />
              <span className="name">Vault Name</span>
              <span className="value">1,000 points</span>
            </div>
            <div className="rank">
              <span className="value">#5</span>
              <span className="price">$1,000.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="layout-content">
      <VultiLoading />
    </div>
  );
};

export default Component;
