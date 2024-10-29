import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message } from "antd";

import { useBaseContext } from "context";
import { VaultProps } from "utils/interfaces";
import { PageKey } from "utils/constants";
import { getStoredVaults, setStoredVaults } from "utils/storage";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import { Vultisig } from "icons";
import DownloadVultisig from "components/download-vultisig";

interface InitialState {
  isInstalled: boolean;
  loading: boolean;
}

const Component: FC = () => {
  const initialState: InitialState = { isInstalled: false, loading: false };
  const [state, setState] = useState(initialState);
  const { isInstalled, loading } = state;
  const { changePage } = useBaseContext();
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

      (window.vultiConnect||window.vultisig).getVaults().then((vaults) => {
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
    changePage(PageKey.IMPORT);

    setState((prevState) => ({
      ...prevState,
      isInstalled: !!(window.vultiConnect||window.vultisig),
    }));
  };

  useEffect(componentDidMount, []);

  return (
    <>
      <div className="import-page">
        <div className="logo">
          <Vultisig />
          Vultisig
        </div>
        <div className="wrapper">
          <h2 className="heading">
            Connect with VultiConnect<br></br>
            or upload your vault QR to start
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
        <DownloadVultisig />
      </div>
      {contextHolder}
    </>
  );
};

export default Component;
