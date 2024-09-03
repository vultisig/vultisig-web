import { FC } from "react";
import { Modal, Spin } from "antd";

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
      <Spin size="large" />
    </Modal>
  );
};

export default Component;
