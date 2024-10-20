import { FC } from "react";
import { Link } from "react-router-dom";
import { Button, Tooltip, message } from "antd";

import { ChainKey, exploreToken } from "utils/constants";
import constantModals from "modals/constant-modals";

import { Copy, Hyperlink, QRCode } from "icons";
import QRCodeModal from "modals/qr-code";

interface ComponentProps {
  address: string;
  name: ChainKey;
}

const Component: FC<ComponentProps> = ({ address, name }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        messageApi.open({
          type: "success",
          content: "Address copied to clipboard",
        });
      })
      .catch(() => {
        messageApi.open({
          type: "error",
          content: "Failed to copy address",
        });
      });
  };

  return (
    <>
      <div className="token-actions">
        <Tooltip title="Copy Address">
          <Button type="link" onClick={handleCopy}>
            <Copy />
          </Button>
        </Tooltip>
        <Tooltip title="View QRCode">
          <Link
            to={`#${constantModals.QR_CODE}_${name.toUpperCase()}`}
            state={true}
          >
            <QRCode />
          </Link>
        </Tooltip>
        <Tooltip title="Link to Address">
          <a
            href={`${exploreToken[name]}${address}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Hyperlink />
          </a>
        </Tooltip>
      </div>

      <QRCodeModal address={address} chain={name} />

      {contextHolder}
    </>
  );
};

export default Component;
