import { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, QRCode, Typography } from "antd";

import constantModals from "modals/constant-modals";

interface InitialState {
  visible: boolean;
}

const Component: FC<{
  address: string;
  chain: string;
}> = ({ address, chain }) => {
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const { visible } = state;
  const { hash } = useLocation();
  const navigate = useNavigate();

  const componentDidUpdate = () => {
    if (hash.startsWith(`#${constantModals.QR_CODE}`)) {
      const key = hash.split(`${constantModals.QR_CODE}_`).pop();

      setState((prevState) => ({
        ...prevState,
        visible: chain.toLowerCase() === key?.toLowerCase(),
      }));
    } else {
      setState(initialState);
    }
  };

  useEffect(componentDidUpdate, [hash]);

  return (
    <Modal
      className="modal-qr-code"
      centered={true}
      footer={false}
      onCancel={() => navigate(-1)}
      open={visible}
      title="Address"
      width={360}
    >
      <Typography.Title level={5}>{address}</Typography.Title>
      <QRCode value={address} size={312} />
    </Modal>
  );
};

export default Component;
