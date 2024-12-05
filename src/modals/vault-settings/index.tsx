import { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { List, Modal } from "antd";

import { VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";

import { ArrowRight, CirclePower, Delete, EditNote, ExternalLink } from "icons";

interface ComponentProps {
  vault?: VaultProps;
}

interface InitialState {
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const { visible } = state;
  const { hash } = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.VAULT_SETTINGS}`: {
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
      className="modal-settings"
      title={vault?.alias}
      centered={true}
      footer={false}
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={480}
    >
      <List>
        <List.Item
          extra={<ArrowRight className="arrow" />}
          onClick={() => navigate(`#${constantModals.RENAME_VAULT}`)}
        >
          <List.Item.Meta
            avatar={<EditNote />}
            description={t(constantKeys.EDIT_VAULT)}
            title={t(constantKeys.RENAME)}
          />
        </List.Item>
        <List.Item
          extra={<ArrowRight className="arrow" />}
          onClick={() => navigate(`#${constantModals.SHARE_SETTINGS}`)}
        >
          <List.Item.Meta
            avatar={<ExternalLink />}
            description={t(constantKeys.SHARE_SETTINGS)}
            title={t(constantKeys.SHARE_SETTINGS_TITLE)}
          />
        </List.Item>
        <List.Item
          extra={<ArrowRight className="arrow" />}
          onClick={() => navigate(`#${constantModals.LOGOUT_VAULT}`)}
          className="warning"
        >
          <List.Item.Meta
            avatar={<CirclePower />}
            description={t(constantKeys.LOGOUT_VAULT)}
            title={t(constantKeys.LOGOUT)}
          />
        </List.Item>
        <List.Item
          extra={<ArrowRight className="arrow" />}
          onClick={() => navigate(`#${constantModals.DELETE_VAULT}`)}
          className="error"
        >
          <List.Item.Meta
            avatar={<Delete />}
            description={t(constantKeys.REMOVE_VAULT)}
            title={t(constantKeys.REMOVE)}
          />
        </List.Item>
      </List>
    </Modal>
  );
};

export default Component;
