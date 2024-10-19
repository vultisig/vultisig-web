import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Modal, Input } from "antd";

import { VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import api from "utils/api";

import { Warning } from "icons";

interface ComponentProps {
  deleteVault: (vault: VaultProps) => void;
  vault?: VaultProps;
}

interface InitialState {
  submitting: boolean;
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ deleteVault, vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = { submitting: false, visible: false };
  const [state, setState] = useState(initialState);
  const { visible, submitting } = state;
  const { hash } = useLocation();
  const goBack = useGoBack();

  const handleSubmit = () => {
    if (!submitting && vault) {
      setState((prevState) => ({ ...prevState, submitting: true }));

      api.vault
        .del(vault)
        .then(() => {
          goBack();

          deleteVault(vault);
        })
        .catch(() => {
          setState((prevState) => ({ ...prevState, submitting: false }));
        });
    }
  };

  const componentDidUpdate = () => {
    switch (hash) {
      case `#${constantModals.DELETE_VAULT}`: {
        setState((prevState) => ({ ...prevState, visible: !!vault }));

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
      className="modal-delete-vault"
      title={t(translation.REMOVE_VAULT_TITLE)}
      centered={true}
      footer={
        <Button
          loading={submitting}
          onClick={handleSubmit}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t(translation.REMOVE_VAULT_TITLE)}
        </Button>
      }
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={550}
    >
      <Warning className="icon" />
      <span className="warning">{t(translation.DELETE_VAULT_WARNING)}:</span>
      <div className="vault-name-container">
        <Input value={vault?.alias} readOnly />
      </div>
    </Modal>
  );
};

export default Component;
