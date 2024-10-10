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
  const { file, status, submitting, theme, visible } = state;
  const { hash } = useLocation();
  const goBack = useGoBack();

  const handleThem = (theme: Theme) => {
    setState((prevState) => ({ ...prevState, theme }));
  };

  const handleSubmit = (): void => {
    if (!submitting && vault && status !== "error") {
      setState((prevState) => ({ ...prevState, loading: true }));

      api.sharedSettings
        .set({
          uid: vault.uid,
          logo: file.data,
          theme,
          publicKeyEcdsa: vault.publicKeyEcdsa,
          publicKeyEddsa: vault.publicKeyEddsa,
          hexChainCode: vault.hexChainCode,
        })
        .then(() => {
          updateVault({ ...vault, logo: file.data, theme });

          setState((prevState) => ({ ...prevState, loading: false }));
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
        errorMessage = "Logo size exceeds the maximum allowed limit of 30KB";
        break;
      default:
        errorMessage = "Someting is wrong";
        break;
    }

    setState((prevState) => ({
      ...prevState,
      error: errorMessage,
      loading: false,
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
          file: { data: vault?.logo ?? "", name: vault?.alias ?? "" },
          theme: vault?.theme ?? Theme.VULTISIG,
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
      footer={false}
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
        {file?.name ? (
          <>
            <Button type="link" className="close" onClick={handleRemove}>
              <CloseOutlined />
            </Button>
            <img src={file.data} className="icon" alt="image" />
            <span className="name">{`${file.name} Uploaded`}</span>
          </>
        ) : state.file?.data !== "" ? (
          <>
            <Button type="link" className="close" onClick={handleRemove}>
              <CloseOutlined />
            </Button>
            <img src={state.file?.data} className="icon" />
            <span className="title">{t(translation.SHARE_CURRENT_LOGO)}</span>
          </>
        ) : (
          <>
            <Button type="link" className="close" onClick={handleRemove}>
              <CloseOutlined />
            </Button>
            <Vultisig className="icon" />
            <span className="title">{t(translation.SHARE_UPLOAD_LOGO)}</span>
            <span className="text">
              {t(translation.DROP_FILE_HERE) + " "}
              <u>{t(translation.UPLOAD_IT)}</u>
            </span>
          </>
        )}
      </Upload.Dragger>
      {state.error ? <span className="title error">{state.error}</span> : null}
      <Button
        disabled={status !== "success"}
        loading={submitting}
        type={status === "success" ? "primary" : "default"}
        onClick={handleSubmit}
        shape="round"
        block
      >
        {t(translation.SAVE)}
      </Button>
    </Modal>
  );
};

export default Component;
