import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, message, List } from "antd";

import { Vultisig } from "icons";
import { CopyOutlined } from "@ant-design/icons";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import useGoBack from "hooks/go-back";
import html2canvas from "html2canvas";

interface InitialState {
  visible: boolean;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const [messageApi, contextHolder] = message.useMessage();
  const { visible } = state;
  const { hash } = useLocation();
  const goBack = useGoBack();

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.SHARE_ACHIEVEMENTS}`: {
        setState((prevState) => ({ ...prevState, visible: true }));

        break;
      }
      default: {
        setState(initialState);

        break;
      }
    }
  };

  useEffect(componentDidUpdate, [hash]);

  const handleShare = async () => {
    const element = document.querySelector(
      ".achievements-info"
    ) as HTMLElement | null;
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      canvas.toBlob((blob) => {
        if (!blob) return;

        const file = new File([blob], "achievements.png", {
          type: "image/png",
        });

        copyImageToClipboard(file);
      }, "image/png");
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  const copyImageToClipboard = async (blob: Blob) => {
    try {
      messageApi.open({
        type: "success",
        content: t(constantKeys.SUCCESSFUL_COPY_IMAGE),
      });
      const clipboardItem = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([clipboardItem]);
    } catch (error) {
      console.error("Error :", error);
    }
  };

  return (
    <Modal
      className="modal-achievements"
      title={t(constantKeys.SHARE_ACHIEVEMENTS)}
      centered={true}
      footer={false}
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={495}
    >
      <div className="achievements-info">
        <div className="logo">
          <Vultisig className="shape" />
          <span className="name">Vultisig</span>
        </div>
        <div className="share-vult">
          <div className="share-info">
            <span
              className="title"
              dangerouslySetInnerHTML={{
                __html: t(
                  constantKeys.MY_SHARE_OF_THE_VULT_AIRDROP
                ).replaceArgs(["<span>$VULT</span>"]),
              }}
            ></span>
            <span className="total-vulties">
              {t(constantKeys.TOTAL_VULTIES)}
            </span>
            <span className="total-vulties-numder">75,450.200</span>
          </div>
          <img
            className="img"
            src="/images/initiate.svg"
            alt="share-achievements"
          />
        </div>
        <ul className="swap-info">
          <li>
            <span className="title">{t(constantKeys.SWAP_VOLUME)}</span>
            <span className="number">$5,000</span>
          </li>
          <li>
            <span className="title">{t(constantKeys.SWAP_MULTIPLIER)}</span>
            <span className="multiplier">1.6X</span>
          </li>
          <li>
            <span className="title">{t(constantKeys.REFERRAL_MULTIPLIER)}</span>
            <span className="multiplier">1.5X</span>
          </li>
        </ul>
      </div>

      <List.Item
        className="contact-links link"
        style={{ backgroundColor: `#03A9F4` }}
        onClick={() => handleShare()}
      >
        <CopyOutlined />
        <span>{t(constantKeys.COPY_IMAGE_TO_CLIPBOARD)}</span>
      </List.Item>

      {contextHolder}
    </Modal>
  );
};

export default Component;
