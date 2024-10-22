import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Collapse, List, Modal, Switch } from "antd";

import { VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantModals from "modals/constant-modals";
import api from "utils/api";

import { Info } from "icons";

interface ComponentProps {
  updateVault: (vault: VaultProps) => void;
  vaults: VaultProps[];
}

interface InitialState {
  loading: boolean;
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ updateVault, vaults }) => {
  const initialState: InitialState = { loading: false, visible: false };
  const [state, setState] = useState(initialState);
  const { visible, loading } = state;
  const { hash } = useLocation();
  const goBack = useGoBack();

  const handleToggle = (vault: VaultProps) => {
    if (!loading) {
      setState((prevState) => ({ ...prevState, loading: true }));

      const action = vault.joinAirdrop
        ? api.airdrop.exit(vault)
        : api.airdrop.join(vault);

      action
        .then(() => {
          updateVault({ ...vault, joinAirdrop: !vault.joinAirdrop });

          setState((prevState) => ({ ...prevState, loading: false }));
        })
        .catch(() => {
          setState((prevState) => ({ ...prevState, loading: false }));
        });
    }
  };

  const componentDidUpdate = () => {
    switch (hash) {
      case `#${constantModals.JOIN_AIRDROP}`: {
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
    <Modal
      className="join-airdrop"
      title="Manage Airdrop Registration"
      centered={true}
      footer={false}
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={550}
    >
      <span className="heading">Registred Vaults:</span>

      <List
        dataSource={vaults}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            extra={
              <Switch
                loading={loading}
                checked={item.joinAirdrop}
                onClick={() => handleToggle(item)}
              />
            }
          >
            <List.Item.Meta title={item.alias} />
          </List.Item>
        )}
      />

      <span className="hint">
        <Info />

        <span>
          Unregistering a vault removes it from the leaderboard. It may take up
          to a day for the balance to be reflected again.
        </span>
      </span>

      <Collapse
        items={[
          {
            key: "1",
            label: "Privacy Information",
            children: (
              <>
                <div className="text">
                  <span className="desc">
                    You are registering your Public Keys and vault addresses.
                  </span>
                  <a
                    href="https://github.com/vultisig/airdrop-registry"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="link"
                  >
                    Inspect the code here.
                  </a>
                </div>

                <div className="text">
                  <span className="desc">
                    Your Airdrop Share is based on the amount of assets in Vultisig multiplied by time in Vaults.
                    <br/>
                    The assets counted for the airdrop can be&nbsp;
                    <a
                    href="https://docs.vultisig.com/vultisig-token/airdrop#eligble-assets"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="link"
                  >
                    seen here.
                  </a>
                    </span>
                    
                </div>

                <div className="text">
                  <span className="desc">
                    No other information is collected.
                  </span>
                  <a
                    href="https://github.com/vultisig/docs/blob/main/other/privacy.md"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="link"
                  >
                    Read the Founder Pledge on Privacy here.
                  </a>
                </div>

                <div className="text">
                  <span className="desc">
                    You can register as many times as you like.
                  </span>
                </div>
              </>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default Component;
