import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Collapse, List, Modal, Switch } from "antd";

import { VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";
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
  const { t } = useTranslation();
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
      case `#${constantModals.MANAGE_AIRDROP}`: {
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
      className="manage-airdrop"
      title="Manage Airdrop Registration"
      centered={true}
      footer={false}
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={550}
    >
      <span className="heading">
        {t(constantKeys.REGISTEREDـVAULTS_AIRDROP)}
      </span>

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

        <span>{t(constantKeys.UNREGISTER_VAULT_INFO)}</span>
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
                    {t(constantKeys.REGISTER_PUBLIC_KEYS_VAULTS)}
                  </span>
                  <a
                    href="https://github.com/vultisig/airdrop-registry"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="link"
                  >
                    {t(constantKeys.INSPECT_CODE_MANAGE)}
                  </a>
                </div>

                <div className="text">
                  <span className="desc">
                    {t(constantKeys.AIRDROP_SHARE_CALCULATION)}
                    <br />
                    {t(constantKeys.ASSENT_COUNT_MANAGE)}&nbsp;
                    <a
                      href="https://docs.vultisig.com/vultisig-token/airdrop#eligble-assets"
                      rel="noopener noreferrer"
                      target="_blank"
                      className="link"
                    >
                      {t(constantKeys.LINK_SEE_HERE)}
                    </a>
                  </span>
                </div>

                <div className="text">
                  <span className="desc">{t(constantKeys.NOT_COLLECTED)}</span>
                  <a
                    href="https://github.com/vultisig/docs/blob/main/other/privacy.md"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="link"
                  >
                    {t(constantKeys.PRIVACY)}
                  </a>
                </div>

                <div className="text">
                  <span className="desc">
                    {t(constantKeys.REPEAT_REGISTRATION)}
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
