import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, List } from "antd";

import { Vultisig } from "icons";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import useGoBack from "hooks/go-back";

interface InitialState {
  visible: boolean;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
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

  const data = [
    {
      key: "X",
      title: `${t(constantKeys.SHARE_ON).replaceArgs(["X"])}`,
      icon: "/images/X-app.png",
      color: "#03A9F4",
    },
    {
      key: "facebook",
      title: `${t(constantKeys.SHARE_ON).replaceArgs(["Facebook"])}`,
      icon: "/images/facebook-icon.png",
      color: "#1877F2",
    },
    {
      key: "whatsapp",
      title: `${t(constantKeys.SHARE_ON).replaceArgs(["Whatsapp"])}`,
      icon: "/images/whatsapp-icon.png",
      color: "#4CAF50",
    },
    {
      key: "telegram",
      title: `${t(constantKeys.SHARE_ON).replaceArgs(["Telegram"])}`,
      icon: "/images/telegram-icon.png",
      color: "#039BE5",
    },
  ];

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
      <List
        className="contact-links"
        dataSource={data}
        renderItem={({ key, title, icon, color }) => (
          <List.Item
            style={{ backgroundColor: `${color}` }}
            // onClick={() => handleSelect(key)}
            className="link"
          >
            <img src={icon} alt={key} />
            {title}
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default Component;
