import { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Input, Modal } from "antd";

import { VaultProps } from "utils/interfaces";
import constantModals from "modals/constant-modals";
import api from "utils/api";

interface ComponentProps {
  vault?: VaultProps;
  setVault: (vault: VaultProps) => void;
}

interface InitialState {
  submitting: boolean;
  visible: boolean;
}

type FieldType = {
  alias: string;
};

const Component: FC<ComponentProps> = ({ setVault, vault }) => {
  const initialState: InitialState = { submitting: false, visible: false };
  const [state, setState] = useState(initialState);
  const { visible, submitting } = state;
  const { hash } = useLocation();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = () => {
    form
      .validateFields()
      .then(({ alias }: FieldType) => {
        if (!submitting && vault) {
          setState((prevState) => ({ ...prevState, submitting: true }));

          api.vault
            .rename({ ...vault, name: alias })
            .then(() => {
              setVault({ ...vault, alias });

              navigate(-1);
            })
            .catch(() => {
              setState((prevState) => ({ ...prevState, submitting: false }));
            });
        }
      })
      .catch(() => {});
  };

  const componentDidUpdate = () => {
    switch (hash) {
      case `#${constantModals.RENAME_VAULT}`: {
        if (vault) {
          setState((prevState) => ({ ...prevState, visible: true }));

          form.setFieldsValue(vault);
        }

        break;
      }
      default: {
        if (visible) form.resetFields();

        setState(initialState);

        break;
      }
    }
  };

  useEffect(componentDidUpdate, [hash]);

  return (
    <Modal
      className="modal-rename-vault"
      title="Rename Vault"
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
          Save
        </Button>
      }
      onCancel={() => navigate(-1)}
      maskClosable={false}
      open={visible}
      width={480}
    >
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item<FieldType> name="alias" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Button htmlType="submit" style={{ display: "none" }} />
      </Form>
    </Modal>
  );
};

export default Component;
