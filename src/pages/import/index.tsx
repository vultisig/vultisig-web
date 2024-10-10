import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { useTranslation } from "react-i18next";

import { VaultProps } from "utils/interfaces";
import { getStoredVaults, setStoredVaults } from "utils/storage";
import translation from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import { Vultisig, VultisigText } from "icons";

interface InitialState {
  isInstalled: boolean;
  loading: boolean;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { isInstalled: false, loading: false };
  const [state, setState] = useState(initialState);
  const { isInstalled, loading } = state;
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const handleUpload = (): void => {
    navigate(constantPaths.upload, { state: true });
  };

  const handelVault = (vault: VaultProps): Promise<void> => {
    return new Promise((resolve) => {
      api.vault
        .add(vault)
        .then((newVault) => {
          const vaults = getStoredVaults();
          const index = vaults.findIndex(
            (old) =>
              old.publicKeyEcdsa === vault.publicKeyEcdsa &&
              old.publicKeyEddsa === vault.publicKeyEddsa
          );

          if (index >= 0) {
            messageApi.open({
              type: "error",
              content: "Vault already exists",
            });
          } else {
            setStoredVaults([
              { ...newVault, hexChainCode: vault.hexChainCode },
              ...vaults,
            ]);
          }

          resolve();
        })
        .catch(() => {
          resolve();
        });
    });
  };

  const handleConnect = (): void => {
    if (isInstalled && !loading) {
      setState((prevState) => ({ ...prevState, loading: true }));

      window.vultiConnect.getVaults().then((vaults) => {
        if (vaults.length) {
          const promises = vaults.map((vault) => handelVault(vault));

          Promise.all(promises).then(() => {
            setState((prevState) => ({ ...prevState, loading: false }));

            navigate(constantPaths.vault.chains);
          });
        } else {
          messageApi.open({
            type: "error",
            content: "No vaults found",
          });
          setState((prevState) => ({ ...prevState, loading: false }));
        }
      });
    }
  };

  const componentDidMount = () => {
    setState((prevState) => ({
      ...prevState,
      isInstalled: !!window.vultiConnect,
    }));
  };

  useEffect(componentDidMount, []);

  return (
    <>
      <div className="import-page">
        <div className="logo-container">
          <Vultisig className="shape" />
          <VultisigText className="text" />
        </div>
        <div className="wrapper">
          <h2 className="heading">
            Connect with VultiConnect<br></br>
            or upload your vault share to start
          </h2>

          <Button
            disabled={!isInstalled}
            loading={loading}
            onClick={handleConnect}
            shape="round"
            type="primary"
            block
          >
            VultiConnect
          </Button>

          <Button onClick={handleUpload} shape="round" type="default" block>
            Upload Vault QR
          </Button>
        </div>
        <p className="hint">{t(translation.DOWNLOAD_APP)}</p>
        <ul className="download">
          <li>
            <a
              href="https://testflight.apple.com/join/kpVufItl"
              target="_blank"
              rel="noopener noreferrer"
              className="image"
            >
              <img src="/images/app-store.png" alt="iPhone" />
            </a>
            <a
              href="https://testflight.apple.com/join/kpVufItl"
              target="_blank"
              rel="noopener noreferrer"
              className="text"
            >
              iPhone
            </a>
          </li>
          <li>
            <a
              href="https://play.google.com/store/apps/details?id=com.vultisig.wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="image"
            >
              <img src="/images/google-play.png" alt="Android" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.vultisig.wallet"
              target="_blank"
              rel="noopener noreferrer"
              className="text"
            >
              Android
            </a>
          </li>
          <li>
            <a
              href="https://github.com/vultisig/vultisig-ios/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="image"
            >
              <img src="/images/github.png" alt="Mac" />
            </a>
            <a
              href="https://github.com/vultisig/vultisig-ios/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text"
            >
              Mac
            </a>
          </li>
        </ul>
      </div>
      {contextHolder}
    </>
  );
};

export default Component;
