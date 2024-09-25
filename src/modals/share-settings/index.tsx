import { FC, useEffect, useState } from "react";
import constantModals from "modals/constant-modals";
import { useLocation } from "react-router-dom";
import { Modal } from "antd";
import { VaultProps } from "utils/interfaces";
import useGoBack from "utils/custom-back";
import { Theme } from "utils/functions";

interface ComponentProps {
  vault?: VaultProps;
}

interface InitialState {
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ vault }) => {
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const [activeTheme, setActiveTheme] = useState(Theme.VULTISIG);
  const { visible } = state;
  const { hash } = useLocation();
  const goBack = useGoBack();

  const handleClick = (theme: Theme) => {
    setActiveTheme(theme);
  };

  const setActiveClass = (theme: Theme) => {
    return activeTheme == theme ? "selected" : "";
  };

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.SHARE_SETTINGS}`: {
        setState((prevState) => ({ ...prevState, visible: !!vault }));

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
      className="modal-share-settings"
      title="Share Settings"
      centered={true}
      footer={false}
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={480}
    >
      <div className="container">
        <div
          onClick={() => handleClick(Theme.DARK)}
          className={`dark ${setActiveClass(Theme.DARK)}`}
        >
          Dark
        </div>
        <div
          onClick={() => handleClick(Theme.LIGHT)}
          className={`light ${setActiveClass(Theme.LIGHT)}`}
        >
          Light
        </div>
        <div
          onClick={() => handleClick(Theme.VULTISIG)}
          className={`vultisig ${setActiveClass(Theme.VULTISIG)}`}
        >
          Vultisig
        </div>
      </div>
    </Modal>
  );
};

export default Component;
