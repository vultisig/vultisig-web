import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Form, Input, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { VaultProps } from "utils/interfaces";
import constantModals from "modals/constant-modals";
import api from "utils/api";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";

interface ComponentProps {
  vault?: VaultProps;
}

interface InitialState {
  submitting: boolean;
  visible: boolean;
}

type FieldType = {
  Code: string;
};

const Component: FC<ComponentProps> = ({ vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = { submitting: false, visible: false };
  const [state, setState] = useState(initialState);
  const { visible, submitting } = state;
  const { hash } = useLocation();
  const [form] = Form.useForm();
  const goBack = useGoBack();

  const handleSubmit = () => {
    form
      .validateFields()
      .then(({ Code }: FieldType) => {
        if (!submitting && vault) {
          setState((prevState) => ({ ...prevState, submitting: true }));

          api.referalCode.set
            ({Code})
            .then(() => {
              goBack();
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
      case `#${constantModals.REFERRAL_CODE}`: {
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
      className="modal-referal-code"
      title={t(constantKeys.REFERRAL_CODE)}
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
          {t(constantKeys.SAVE)}
        </Button>
      }
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={480}
    >
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item<FieldType> name="Code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Button htmlType="submit" style={{ display: "none" }} />
      </Form>
    </Modal>
  );
};

export default Component;
