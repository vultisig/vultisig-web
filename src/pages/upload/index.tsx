import { FC, Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useTranslation } from "react-i18next";
import { Button, Carousel, Upload, UploadProps } from "antd";
import { ReaderOptions, readBarcodesFromImageFile } from "zxing-wasm/reader";

import { useBaseContext } from "context";
import { toCamelCase } from "utils/functions";
import { errorKey, PageKey } from "utils/constants";
import { FileProps, VaultProps } from "utils/interfaces";
import { getStoredVaults, setStoredVaults } from "utils/storage";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";
import api from "utils/api";

import { CloseLG, Vultisig } from "icons";
import DownloadVultisig from "components/download-vultisig";

interface InitialState {
  file?: FileProps;
  hint: { image: string; title: string }[];
  loading: boolean;
  status: "default" | "error" | "success";
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    hint: [
      {
        image: "/images/qr-export-one.png",
        title: "Open your Vultisig app on mobile",
      },
      {
        image: "/images/qr-export-two.png",
        title: "Export the Vault QR in the top right corner",
      },
      {
        image: "/images/qr-export-three.png",
        title: "Import your Vault QR code here",
      },
    ],
    loading: false,
    status: "default",
  };
  const [state, setState] = useState(initialState);
  const { file, hint, loading, status, vault } = state;
  const { changePage } = useBaseContext();
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ query: "(min-width: 576px)" });

  const handleStart = (): void => {
    if (!loading && vault && status === "success") {
      setState((prevState) => ({ ...prevState, loading: true }));

      api.vault
        .add(vault)
        .then((newVault) => {
          if (newVault) {
            const vaults = getStoredVaults();

            const index = vaults.findIndex(
              (old) =>
                old.publicKeyEcdsa === vault.publicKeyEcdsa &&
                old.publicKeyEddsa === vault.publicKeyEddsa
            );

            if (index >= 0) {
              setStoredVaults(
                vaults.map((vault, ind) => ({
                  ...vault,
                  isActive: ind === index,
                }))
              );
            } else {
              setStoredVaults([
                { ...vault, isActive: true },
                ...vaults.map((vault) => ({
                  ...vault,
                  isActive: false,
                })),
              ]);
            }

            navigate(constantPaths.vault.chains);
          } else {
            setState((prevState) => ({
              ...prevState,
              loading: false,
              status: "error",
            }));
          }
        })
        .catch(() => {
          setState((prevState) => ({
            ...prevState,
            loading: false,
            status: "error",
          }));
        });
    }
  };

  const handleRemove = (): void => {
    setState(initialState);
  };

  const handleError = (error: string) => {
    setState((prevState) => ({ ...prevState, status: "error" }));

    switch (error) {
      case errorKey.INVALID_EXTENSION:
        console.error("Invalid file extension");
        break;
      case errorKey.INVALID_FILE:
        console.error("Invalid file");
        break;
      case errorKey.INVALID_QRCODE:
        console.error("Invalid qr code");
        break;
      case errorKey.INVALID_VAULT:
        console.error("Invalid vault data");
        break;
      default:
        console.error("Someting is wrong");
        break;
    }
  };

  const handleUpload = (file: File): false => {
    setState(initialState);

    const reader = new FileReader();

    const imageFormats: string[] = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/bmp",
    ];

    reader.onload = () => {
      const readerOptions: ReaderOptions = {
        tryHarder: true,
        formats: ["QRCode"],
        maxNumberOfSymbols: 1,
      };

      setState((prevState) => ({
        ...prevState,
        file: {
          data: reader.result?.toString() || "",
          name: file.name,
        },
      }));

      readBarcodesFromImageFile(file, readerOptions)
        .then(([result]) => {
          if (result) {
            try {
              const vault: VaultProps = JSON.parse(result.text);
              setState((prevState) => ({
                ...prevState,
                vault: toCamelCase(vault),
                status: "success",
              }));
            } catch {
              handleError(errorKey.INVALID_VAULT);
            }
          }
        })
        .catch(() => {
          handleError(errorKey.INVALID_QRCODE);
        });
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

  const componentDidMount = () => {
    changePage(PageKey.UPLOAD);
  };

  useEffect(componentDidMount, []);

  return (
    <div className="layout-content upload-page">
      <div className="logo">
        <Vultisig />
        Vultisig
      </div>
      <div className="wrapper">
        <h2 className="heading">{t(constantKeys.UPLOAD_VAULT_SHARE)}</h2>
        <Upload.Dragger {...props} className={status}>
          {file ? (
            <>
              <Button type="link" className="close" onClick={handleRemove}>
                <CloseLG />
              </Button>
              <img src={file.data} className="image" alt="image" />
              <h3 className="name">{`${file.name} Uploaded`}</h3>
            </>
          ) : (
            <>
              <img src="/images/qr-code.svg" className="icon" alt="qr" />
              <h3 className="title">{t(constantKeys.UPLOAD_QR_CODE)}</h3>
              <span className="text">
                {t(constantKeys.DROP_FILE_HERE)}
                <u>{t(constantKeys.UPLOAD_IT)}</u>
              </span>
            </>
          )}
        </Upload.Dragger>
        <p className="hint">{t(constantKeys.HINT)}</p>
        <Button
          disabled={status !== "success"}
          loading={loading}
          onClick={handleStart}
          type={status === "success" ? "primary" : "default"}
          shape="round"
          block
        >
          {t(constantKeys.START)}
        </Button>
        <div className="export">
          <h3 className="title">Instructions</h3>

          {isTablet ? (
            <ul className="grid">
              {hint.map(({ image, title }, index) => (
                <li key={index}>
                  <img src={image} className="image" />
                  <span className="text">{title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Carousel effect="fade">
              {hint.map(({ image, title }, index) => (
                <Fragment key={index}>
                  <img src={image} className="image" />
                  <span className="text">{title}</span>
                </Fragment>
              ))}
            </Carousel>
          )}
        </div>
      </div>
      <DownloadVultisig />
    </div>
  );
};

export default Component;
