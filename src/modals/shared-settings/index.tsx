import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Modal, Upload, UploadProps } from "antd";
import { useTranslation } from "react-i18next";

import { Theme, errorKey } from "utils/constants";
import { FileProps, VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import api from "utils/api";

import { CloseOutlined, Vultisig } from "icons";

interface ComponentProps {
  updateVault(vault: VaultProps): void;
  vault?: VaultProps;
}

interface InitialState {
  file: FileProps;
  submitting: boolean;
  status: "default" | "error" | "success";
  theme: Theme;
  visible: boolean;
  error: string;
}

const Component: FC<ComponentProps> = ({ updateVault, vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    submitting: false,
    status: "success",
    theme: Theme.VULTISIG,
    visible: false,
    file: { data: "", name: "" },
    error: "",
  };
  const [state, setState] = useState(initialState);
  const { error, file, status, submitting, theme, visible } = state;
  const { hash } = useLocation();
  const goBack = useGoBack();

  const handleThem = (theme: Theme) => {
    setState((prevState) => ({ ...prevState, theme }));
  };

  const handleSubmit = (): void => {
    if (!submitting && vault && status !== "error") {
      setState((prevState) => ({ ...prevState, submitting: true }));

      api.sharedSettings
        .set({
          uid: vault.uid,
          logo: file.data ?? "",
          theme,
          publicKeyEcdsa: vault.publicKeyEcdsa,
          publicKeyEddsa: vault.publicKeyEddsa,
          hexChainCode: vault.hexChainCode,
        })
        .then(() => {
          updateVault({ ...vault, logo: file.data, theme });

          setState((prevState) => ({ ...prevState, submitting: false }));
          
          goBack();
        })
        .catch((data) => {
          handleError(data);
        });
    }
  };

  const handleRemove = (): void => {
    setState((prevState) => ({
      ...prevState,
      error: "",
      file: { data: "", name: "" },
      status: "default",
    }));
  };

  const handleError = (error: string) => {
    let errorMessage = "";

    switch (error) {
      case errorKey.INVALID_EXTENSION:
        errorMessage = "Invalid file extension";
        break;
      case errorKey.INVALID_FILE:
        errorMessage = "Invalid file";
        break;
      case errorKey.LOGO_TOO_LARGE:
        errorMessage = "The maximum allowed logo size is 100KB";
        break;
      default:
        errorMessage = "Someting is wrong";
        break;
    }

    setState((prevState) => ({
      ...prevState,
      error: errorMessage,
      submitting: false,
      status: "error",
    }));
  };

  const handleUpload = (file: File): false => {
    const reader = new FileReader();

    const imageFormats: string[] = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/bmp",
    ];

    reader.onload = () => {
      setState((prevState) => ({
        ...prevState,
        file: {
          data: reader.result as string,
          name: file.name,
        },
        status: "success",
        error: "",
      }));
    };

    reader.onerror = () => {
      handleError(errorKey.INVALID_FILE);
    };

    if (imageFormats.indexOf(file.type) >= 0) {
      reader.readAsDataURL(file);
    } else {
      handleError(errorKey.INVALID_EXTENSION);
    }

    return false;
  };

  const props: UploadProps = {
    multiple: false,
    showUploadList: false,
    beforeUpload: handleUpload,
    fileList: [],
  };

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.SHARE_SETTINGS}`: {
        setState((prevState) => ({
          ...prevState,
          file: {
            data: vault?.logo ?? "",
            name: vault?.alias ?? "",
          },
          theme:
            vault?.theme === Theme.DARK
              ? Theme.DARK
              : vault?.theme === Theme.LIGHT
              ? Theme.LIGHT
              : Theme.VULTISIG,
          visible: !!vault,
        }));

        break;
      }
      default: {
        setState(initialState);

        break;
      }
    }
  };

  useEffect(componentDidUpdate, [hash, vault]);

  return (
    <Modal
      className="modal-share-settings"
      title={t(translation.SHARE_SETTINGS_TITLE)}
      centered={true}
      footer={
        <Button
          disabled={status === "error"}
          loading={submitting}
          type="primary"
          onClick={handleSubmit}
          shape="round"
          block
        >
          {t(translation.SAVE)}
        </Button>
      }
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={480}
    >
      <span className="title">{t(translation.SHARE_VAULT_THEME)}:</span>

      <div className="themes">
        <span
          className={`dark${theme === Theme.DARK ? " selected" : ""}`}
          onClick={() => handleThem(Theme.DARK)}
        >
          Dark
        </span>
        <span
          className={`light${theme === Theme.LIGHT ? " selected" : ""}`}
          onClick={() => handleThem(Theme.LIGHT)}
        >
          Light
        </span>
        <span
          className={`vultisig${theme === Theme.VULTISIG ? " selected" : ""}`}
          onClick={() => handleThem(Theme.VULTISIG)}
        >
          Vultisig
        </span>
      </div>

      <span className="title">{t(translation.SHARE_VAULT_LOGO)}:</span>

      <Upload.Dragger {...props} className={status}>
        {file?.data ? (
          <>
            <img src={file.data} className="icon" />
            <span className="name">
              {status === "default"
                ? `${file.name} Uploaded`
                : t(translation.SHARE_CURRENT_LOGO)}
            </span>
            {error ? (
              <span className="text error">{error}</span>
            ) : (
              <span className="text">File successfully selected</span>
            )}
          </>
        ) : (
          <>
            <Vultisig className="icon" />
            <span className="name">{t(translation.SHARE_UPLOAD_LOGO)}</span>
            <span className="text">
              {t(translation.DROP_FILE_HERE)}
              <u>{t(translation.UPLOAD_IT)}</u>
            </span>
          </>
        )}
      </Upload.Dragger>

      {status !== "default" && (
        <Button type="link" className="remove" onClick={handleRemove}>
          <CloseOutlined />
        </Button>
      )}
    </Modal>
  );
};

export default Component;
