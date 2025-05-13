import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "antd";

import { VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

interface InitialState {
  visible: boolean;
}

interface ComponentProps {
  vault: VaultProps;
}

const Component: FC<ComponentProps> = ({ vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const { visible } = state;
  const { hash } = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();

  const handleLeaderboard = () => {
    navigate(constantPaths.vault.aridrop, { state: true });
  };

  const componentDidUpdate = () => {
    switch (hash) {
      case `#${constantModals.JOIN_AIRDROP}`: {
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

  return (
    <Modal
      className="join-airdrop"
      title="Congratulations"
      centered={true}
      footer={
        <Button type="primary" onClick={handleLeaderboard} block>
          {t(constantKeys.CHECK_LEANDER_BOARD)}
        </Button>
      }
      onCancel={() => goBack()}
      open={visible}
      closeIcon={false}
      width={472}
    >
      <img
        src="/images/vulti-robo.png"
        alt="Vultisig Robot"
        className="image"
      />
      <span className="heading">{t(constantKeys.CONGRATULATIONS)}</span>
      <span className="text">
        {t(constantKeys.VAULT_AIRDROP_JOINED).replaceArgs([vault.alias])}
      </span>
    </Modal>
  );
};

export default Component;
