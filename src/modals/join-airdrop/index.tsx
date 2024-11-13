import { FC, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Modal } from "antd";

import { VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

interface InitialState {
  visible: boolean;
}

interface ComponentProps {
  vault: VaultProps;
}

const Component: FC<ComponentProps> = ({ vault }) => {
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const { visible } = state;
  const { hash } = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();

  const handleLeaderboard = () => {
    navigate(constantPaths.vault.leaderboard, { state: true });
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
          Check Leaderboard
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
      <span className="heading">Congratulations!</span>
      <span className="text">{`Your Vault ${vault.alias} has joined the Vultisig Airdrop. You will now begin to accumulate VULTIES on a daily basis. Check back tomorrow to see your first VULTIES on the Leaderboard and check out your competitors.`}</span>
    </Modal>
  );
};

export default Component;
