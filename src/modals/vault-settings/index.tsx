import { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { List, Modal } from "antd";

import { VaultProps } from "utils/interfaces";
import constantModals from "modals/constant-modals";

import { CaretRightOutlined, EditOutlined, TrashOutlined } from "icons";

interface ComponentProps {
  vault?: VaultProps;
}

interface InitialState {
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ vault }) => {
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const { visible } = state;
  const { hash } = useLocation();
  const navigate = useNavigate();

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
      onCancel={() => navigate(-1)}
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
            description={"Edit your vault name"}
            title={"Rename"}
          />
        </List.Item>
        <List.Item
          extra={<CaretRightOutlined className="arrow" />}
          onClick={() => navigate(`#${constantModals.DELETE_VAULT}`)}
          className="delete"
        >
          <List.Item.Meta
            avatar={<TrashOutlined />}
            description={"Delete your vault share permanently"}
            title={"Delete"}
          />
        </List.Item>
      </List>
    </Modal>
  );
};

export default Component;
