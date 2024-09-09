import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Modal } from "antd";

import constantModals from "modals/constant-modals";
import api from "utils/api";
import useGoBack from "utils/custom-back";

import { WarningOutlined } from "icons";
import { VaultProps } from "utils/interfaces";

interface ComponentProps {
  delVault: (vault: VaultProps) => void;
  vault?: VaultProps;
}

interface InitialState {
  submitting: boolean;
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ delVault, vault }) => {
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
          delVault(vault);

          goBack();
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
      title="Delete Vault"
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
          Delete Vault
        </Button>
      }
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={550}
    >
      <WarningOutlined className="icon" />
      <span className="warning">You are permanently deleting your vault</span>
    </Modal>
  );
};

export default Component;
