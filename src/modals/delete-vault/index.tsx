import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, Modal, message } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

import { VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";
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
  isChecked: boolean;
}

const Component: FC<ComponentProps> = ({ deleteVault, vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    submitting: false,
    visible: false,
    isChecked: false,
  };
  const [state, setState] = useState(initialState);
  const [messageApi, contextHolder] = message.useMessage();
  const { visible, submitting, isChecked } = state;
  const { hash } = useLocation();

  const goBack = useGoBack();

  const handleSubmit = () => {
    if (!isChecked) {
      messageApi.open({
        type: "error",
        content: t(constantKeys.CONFIRM_REMOVE_VAULT_WARNING),
      });
      return;
    }

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
        setState((prevState) => ({
          ...prevState,
          visible: !!vault,
          isChecked: false,
        }));
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
      title={t(constantKeys.REMOVE_VAULT_TITLE)}
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
          {t(constantKeys.REMOVE_VAULT_TITLE)}
        </Button>
      }
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={480}
    >
      <Warning className="icon" />
      <span className="warning">{t(constantKeys.DELETE_VAULT_WARNING)}:</span>
      <span className="name">{vault?.alias}</span>
      <div className="warning-message">
        <InfoCircleOutlined />
        <p>
          {t(constantKeys.CONFIRM_REMOVE_DESCRIPRION)}
          <br />
          {t(constantKeys.CONFIRM_REMOVE_DESCRIPRION1)}
        </p>
      </div>

      <Checkbox
        className="confirm"
        checked={isChecked}
        onChange={(e) =>
          setState((prev) => ({ ...prev, isChecked: e.target.checked }))
        }
      >
        {t(constantKeys.CONFIRM_REMOVE_CHECKBOX)}
      </Checkbox>
      {contextHolder}
    </Modal>
  );
};

export default Component;
