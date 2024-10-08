import { FC, useEffect, useState } from "react";
import constantModals from "modals/constant-modals";
import { useLocation } from "react-router-dom";
import { Button, Modal, Upload, UploadProps } from "antd";
import { FileProps, VaultProps } from "utils/interfaces";
//import { getVaults, setVaults } from "utils/vault";
import { useTranslation } from "react-i18next";
import useGoBack from "utils/custom-back";
//import api from "utils/api";
import { Theme } from "utils/functions";
import { errorKey } from "utils/constants";
import { CloseOutlined } from "icons";
import translation from "i18n/constant-keys";
import { getSharedSettings, setSharedSettings } from "utils/vault";
import api from "utils/api";
import { Vultisig } from "icons";

interface ComponentProps {
  vault?: VaultProps;
}

interface InitialState {
  file?: FileProps;
  loading: boolean;
  status: "default" | "error" | "success";
  theme: Theme;
  visible: boolean;
  error_Status: string;
}

const Component: FC<ComponentProps> = ({ vault }) => {
  const { t } = useTranslation();
  const shareSetting = getSharedSettings();
  const initialState: InitialState = {
    loading: false,
    status: "success",
    theme: shareSetting.theme || Theme.VULTISIG,
    visible: false,
    file: {
      data: shareSetting.logo,
      name: "",
    },
    error_Status: "",
  };

  const [state, setState] = useState(initialState);
  const { file, loading, status, theme, visible } = state;
  const { hash } = useLocation();
  const goBack = useGoBack();

  const handleThemClick = (theme: Theme) => {
    setState((prevState) => ({
      ...prevState,
      theme,
      file: {
        data: state.file?.data as string,
        name: "",
      },
      error_Status: "",
    }));
  };

  const handleSave = (): void => {
    if (!loading && theme && status === "success") {
      setState((prevState) => ({
        ...prevState,
        loading: true,
        error_Status: "",
      }));

      api.sharedSettings
        .set({
          uid: vault?.uid,
          logo: file?.data as string,
          theme: theme,
          publicKeyEcdsa: vault?.publicKeyEcdsa,
          publicKeyEddsa: vault?.publicKeyEddsa,
          hexChainCode: vault?.hexChainCode,
        })
        .then(() => {
          const fi: FileProps =
            (file?.data as string) != ""
              ? { data: file?.data as string, name: "" }
              : { data: "", name: "" };

          setSharedSettings(file?.data as string, state.theme);

          setState((prevState) => ({
            ...prevState,
            theme,
            file: fi,
            loading: false,
            status: "success",
            visible: false,
            error_Status: "",
          }));
        })
        .catch((data) => {
          handleError(data);
        });
    }
  };

  const handleRemove = (): void => {
    setSharedSettings("", state.theme);
    setState((prevState) => ({
      ...prevState,
      status: "success",
      file: {
        data: "",
        name: "",
      },
      error_Status: "",
    }));
  };

  const handleError = (error: string) => {
    let errorMessage = "";
    switch (error) {
      case errorKey.INVALID_EXTENSION:
        console.error("Invalid file extension");
        errorMessage = "Invalid file extension";
        break;
      case errorKey.INVALID_FILE:
        console.error("Invalid file");
        errorMessage = "Invalid file";
        break;
      case errorKey.LOGO_TOO_LARGE:
        console.error("logo too large");
        errorMessage = "Logo size exceeds the maximum allowed limit of 100KB";
        break;
      default:
        
        console.error("Someting is wrong");
        errorMessage = "Someting is wrong";
        break;
    }

    setState((prevState) => ({
      ...prevState,
      status: "error",
      error_Status: errorMessage,
      loading: false,
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
        error_Status: "",
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

  const setActiveClass = (value: Theme) => {
    return theme == value ? "selected" : "";
  };

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.SHARE_SETTINGS}`: {
        var sharedSettings = getSharedSettings();
        setState((prevState) => ({
          ...prevState,
          theme: sharedSettings.theme,
          visible: !!vault,
          file: {
            data: sharedSettings.logo,
            name: "",
          },
          error_Status: "",
        }));

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
      title={t(translation.SHARE_SETTINGS_TITLE)}
      centered={true}
      footer={false}
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={480}
    >
      <h4 className="title">{t(translation.SHARE_VAULT_THEME)}:</h4>

      <div className="themes">
        <span
          onClick={() => handleThemClick(Theme.DARK)}
          className={`dark ${setActiveClass(Theme.DARK)}`}
        >
          Dark
        </span>
        <span
          onClick={() => handleThemClick(Theme.LIGHT)}
          className={`light ${setActiveClass(Theme.LIGHT)}`}
        >
          Light
        </span>
        <span
          onClick={() => handleThemClick(Theme.VULTISIG)}
          className={`vultisig ${setActiveClass(Theme.VULTISIG)}`}
        >
          Vultisig
        </span>
      </div>

      <h4 className="title">{t(translation.SHARE_VAULT_LOGO)}:</h4>

      <Upload.Dragger {...props} className={status}>
        {file?.name ? (
          <>
            <Button type="link" className="close" onClick={handleRemove}>
              <CloseOutlined />
            </Button>
            <img src={file.data} className="icon" alt="image" />
            <h3 className="name">{`${file.name} Uploaded`}</h3>
          </>
        ) : state.file?.data !== "" ? (
          <>
            <Button type="link" className="close" onClick={handleRemove}>
              <CloseOutlined />
            </Button>
            <img src={state.file?.data} className="icon" />
            <h3 className="title">{t(translation.SHARE_CURRENT_LOGO)}</h3>
          </>
        ) : (
          <>
            <Button type="link" className="close" onClick={handleRemove}>
              <CloseOutlined />
            </Button>
            <Vultisig className="icon" />
            <h3 className="title">{t(translation.SHARE_UPLOAD_LOGO)}</h3>
            <span className="text">
              {t(translation.DROP_FILE_HERE) + " "}
              <u>{t(translation.UPLOAD_IT)}</u>
            </span>
          </>
        )}
      </Upload.Dragger>
      {state.error_Status ? (
        <h4 className="title error">{state.error_Status}</h4>
      ) : null}
      <Button
      shape="round"
        disabled={status !== "success"}
        loading={loading}
        onClick={handleSave}
        type={status === "success" ? "primary" : "default"}
        block
      >
        {t(translation.SAVE)}
      </Button>
    </Modal>
  );
};

export default Component;
