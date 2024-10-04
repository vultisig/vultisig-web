import { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { List, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { VaultProps } from "utils/interfaces";
import constantModals from "modals/constant-modals";
import useGoBack from "utils/custom-back";
import translation from "i18n/constant-keys";

import {
  CaretRightOutlined,
  EditOutlined,
  TrashOutlined,
  ShareOutlined,
} from "icons";

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
          extra={<CaretRightOutlined className="arrow" />}
          onClick={() => navigate(`#${constantModals.RENAME_VAULT}`)}
        >
          <List.Item.Meta
            avatar={<EditOutlined />}
            description={t(translation.EDIT_VAULT)}
            title={t(translation.RENAME)}
          />
        </List.Item>
        <List.Item
          extra={<CaretRightOutlined className="arrow" />}
          onClick={() => navigate(`#${constantModals.SHARE_SETTINGS}`)}
        >
          <List.Item.Meta
            avatar={<ShareOutlined />}
            description={t(translation.SHARE_SETTINGS)}
            title={t(translation.SHARE_SETTINGS_TITLE)}
          />
        </List.Item>
        <List.Item
          extra={<CaretRightOutlined className="arrow" />}
          onClick={() => navigate(`#${constantModals.DELETE_VAULT}`)}
          className="delete"
        >
          <List.Item.Meta
            avatar={<TrashOutlined />}
            description={t(translation.REMOVE_VAULT)}
            title={t(translation.REMOVE)}
          />
        </List.Item>
      </List>
    </Modal>
  );
};

export default Component;
