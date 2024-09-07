import { FC } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
//import { useTranslation } from "react-i18next";
import { Button, message, Tooltip } from "antd";
import { Truncate } from "@re-dev/react-truncate";

import { useBaseContext } from "context/base";
import { useSharedContext } from "context/shared";
import { exploreToken } from "utils/constants";
import constantModals from "modals/constant-modals";

import AssetItem from "components/asset-item";
import TokenImage from "components/token-image";
import QRCode from "modals/qr-code";
//import translation from "i18n/constant-keys";

import {
  CaretRightOutlined,
  CopyOutlined,
  CubeOutlined,
  QRCodeOutlined,
} from "icons";

const Component: FC = () => {
  //const { t } = useTranslation();
  const { chainKey } = useParams();
  const { currency } = useBaseContext();
  const { vault } = useSharedContext();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const chain = vault?.chains.find(
    ({ name }) => name.toLowerCase() === chainKey
  );

  const handleCopy = () => {
    navigator.clipboard
      .writeText(chain?.address || "")
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

  return chain ? (
    <>
      <div className="layout-content assets-page">
        <div className="breadcrumb">
          <Button type="link" className="back" onClick={() => navigate(-1)}>
            <CaretRightOutlined />
          </Button>
          <h1>{chain.name}</h1>
        </div>
        <div className="content">
          <div className="chain">
            <div className="type">
              <TokenImage alt={chain.name} />
              {chain.name}
            </div>
            <div className="key">
              <Truncate end={10} middle>
                {chain.address}
              </Truncate>
            </div>
            <span className="amount">
              {chain.coins
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
                <Link to={`#${constantModals.QR_CODE}`}>
                  <QRCodeOutlined />
                </Link>
              </Tooltip>
              <Tooltip title="Link to Address">
                <a
                  href={`${exploreToken[chain.name]}${chain.address}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <CubeOutlined />
                </a>
              </Tooltip>
            </div>
          </div>
          {chain.coins
            .slice()
            .sort((a, b) => b.balance * b.value - a.balance * a.value)
            .map(({ ticker, ...res }) => (
              <AssetItem key={ticker} {...{ ...res, ticker }} />
            ))}
        </div>
      </div>

      {chain && <QRCode address={chain.address} chain={chain.name} />}

      {contextHolder}
    </>
  ) : (
    <></>
  );
};

export default Component;
