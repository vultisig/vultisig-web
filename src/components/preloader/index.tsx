import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "antd";

import constantKeys from "i18n/constant-keys";

import VultiLoading from "components/vulti-loading";

interface ComponentProps {
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ visible }) => {
  const { t } = useTranslation();

  return (
    <Modal
      className="modal-preloader"
      closeIcon={false}
      footer={false}
      maskClosable={false}
      open={visible}
      title={`${t(constantKeys.LOADING)}...`}
      centered
    >
      <VultiLoading />
    </Modal>
  );
};

export default Component;
