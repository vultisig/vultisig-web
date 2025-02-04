import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Modal, Upload, UploadProps } from "antd";

import { Theme, errorKey } from "utils/constants";
import { FileProps, VaultProps } from "utils/interfaces";
import useGoBack from "hooks/go-back";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import api from "utils/api";

import { CloseLG, Vultisig } from "icons";
import VultiLoading from "components/vulti-loading";

interface ComponentProps {
  vault?: VaultProps;
}

interface InitialState {
  file: FileProps;
  loaded: boolean;
  submitting: boolean;
  status: "default" | "error" | "success";
  theme: Theme;
  visible: boolean;
  error: string;
}

const Component: FC<ComponentProps> = ({ vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    loaded: false,
    submitting: false,
    status: "success",
    theme: Theme.VULTISIG,
    visible: false,
    file: { data: "", name: "" },
    error: "",
  };
  const [state, setState] = useState(initialState);
  const { error, file, loaded, status, submitting, theme, visible } = state;
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
          logo: file.data || "",
          theme,
          publicKeyEcdsa: vault.publicKeyEcdsa,
          publicKeyEddsa: vault.publicKeyEddsa,
          hexChainCode: vault.hexChainCode,
        })
        .then(() => {
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
        errorMessage = t(constantKeys.ERROR_FILE_EXTENSION);
        break;
      case errorKey.INVALID_FILE:
        errorMessage = t(constantKeys.ERROR_INVALID_FILE);
        break;
      case errorKey.LOGO_TOO_LARGE:
        errorMessage = t(constantKeys.LOGO_SIZE);
        break;
      default:
        errorMessage = t(constantKeys.SOMETHING_WRONG);
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
        if (vault) {
          setState((prevState) => ({ ...prevState, visible: true }));

          api.sharedSettings
            .get(vault.uid)
            .then(({ data: { logo, theme } }) => {
              setState((prevState) => ({
                ...prevState,
                file: { data: logo, name: vault.alias },
                theme:
                  theme === Theme.DARK
                    ? Theme.DARK
                    : theme === Theme.LIGHT
                    ? Theme.LIGHT
                    : Theme.VULTISIG,
                loaded: true,
              }));
            });
        } else {
          setState(initialState);
        }

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
      title={t(constantKeys.SHARE_SETTINGS_TITLE)}
      centered={true}
      footer={
        loaded ? (
          <Button
            disabled={status === "error"}
            loading={submitting}
            type="primary"
            onClick={handleSubmit}
            shape="round"
            block
          >
            {t(constantKeys.SAVE)}
          </Button>
        ) : (
          <VultiLoading />
        )
      }
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={480}
    >
      {loaded && (
        <>
          <span className="title">{t(constantKeys.SHARE_VAULT_THEME)}:</span>

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
              className={`vultisig${
                theme === Theme.VULTISIG ? " selected" : ""
              }`}
              onClick={() => handleThem(Theme.VULTISIG)}
            >
              Vultisig
            </span>
          </div>

          <span className="title">{t(constantKeys.SHARE_VAULT_LOGO)}:</span>

          <Upload.Dragger {...props} className={status}>
            {file?.data ? (
              <>
                <img src={file.data} className="icon" />
                <span className="name">
                  {status === "default"
                    ? `${file.name} Uploaded`
                    : t(constantKeys.SHARE_CURRENT_LOGO)}
                </span>
                {error ? (
                  <span className="text error">{error}</span>
                ) : (
                  <span className="text">
                    {t(constantKeys.FILE_SELECTED_SUCCESS)}
                  </span>
                )}
              </>
            ) : (
              <>
                <Vultisig className="icon" />
                <span className="name">
                  {t(constantKeys.SHARE_UPLOAD_LOGO)}
                </span>
                <span className="text">
                  {t(constantKeys.DROP_FILE_HERE)}
                  <u>{t(constantKeys.UPLOAD_IT)}</u>
                </span>
              </>
            )}
          </Upload.Dragger>

          {status !== "default" && (
            <Button type="link" className="remove" onClick={handleRemove}>
              <CloseLG />
            </Button>
          )}
        </>
      )}
    </Modal>
  );
};

export default Component;
