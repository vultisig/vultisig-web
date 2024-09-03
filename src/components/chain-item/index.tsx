import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Tooltip, message } from "antd";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context/base";
import { Chain, exploreToken } from "utils/constants";
import { CoinProps } from "utils/interfaces";
import constantModals from "modals/constant-modals";

import {
  CaretRightOutlined,
  CopyOutlined,
  CubeOutlined,
  QRCodeOutlined,
} from "icons";
import TokenImage from "components/token-image";
import QRCode from "modals/qr-code";

interface ComponentProps {
  address: string;
  coins: CoinProps[];
  name: Chain;
}

const Component: FC<ComponentProps> = ({ address, coins, name }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { pathname } = useLocation();
  const { currency } = useBaseContext();

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

  const coin = coins.find(({ isNative }) => isNative);

  return coin ? (
    <>
      <div className="chain-item">
        <div className="type">
          <TokenImage alt={name} />
          <span className="name">{name}</span>
          <span className="text">{coin?.ticker}</span>
        </div>
        <div className="key">
          <Truncate end={10} middle>
            {address}
          </Truncate>
        </div>
        <span className={`asset${coins.length > 1 ? " multi" : ""}`}>
          {coins.length > 1
            ? `${coins.length} assets`
            : coin.balance.toBalanceFormat()}
        </span>
        <span className="amount">
          {coins
            .reduce((acc, coin) => acc + coin.balance * coin.value, 0)
            .toValueFormat(currency)}
        </span>
        <div className="actions">
          <Tooltip title="Copy Address">
            <Button type="link" onClick={handleCopy}>
              <CopyOutlined />
            </Button>
          </Tooltip>
          <Tooltip title="View QRCode">
            <Link to={`#${constantModals.QR_CODE}_${name.toUpperCase()}`}>
              <QRCodeOutlined />
            </Link>
          </Tooltip>
          <Tooltip title="Link to Address">
            <a
              href={`${exploreToken[name]}${address}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <CubeOutlined />
            </a>
          </Tooltip>
        </div>
        <Link to={`${pathname}/${name.toLowerCase()}`} className="arrow">
          <CaretRightOutlined />
        </Link>
      </div>

      <QRCode address={address} chain={name} />

      {contextHolder}
    </>
  ) : (
    <></>
  );
};

export default Component;
