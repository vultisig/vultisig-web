import { FC } from "react";
import { Modal } from "antd";

import VultiLoading from "components/vulti-loading";

interface ComponentProps {
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ visible }) => {
  return (
    <Modal
      className="modal-preloader"
      closeIcon={false}
      footer={false}
      maskClosable={false}
      open={visible}
      title="Loading..."
      centered
    >
      <VultiLoading />
    </Modal>
  );
};

export default Component;
