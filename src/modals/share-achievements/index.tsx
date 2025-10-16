import { FC, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, message, List, Spin } from "antd";

import { Vultisig } from "icons";
import { CopyOutlined } from "@ant-design/icons";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import useGoBack from "hooks/go-back";
import html2canvas from "html2canvas";
import { VaultProps } from "utils/interfaces";
import {
  calcSwapMultiplier,
  calcReferralMultiplier,
  getActivity,
  getCurrentSeason,
} from "utils/functions";
import api from "utils/api";
import { useBaseContext } from "context";

type ModalProps = {
  vault: VaultProps;
};

type InitialState = {
  visible?: boolean;
  rank?: number;
  referral?: number;
  swap?: number;
  total?: number;
};

const Component: FC<ModalProps> = ({ vault }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<InitialState>({});
  const { rank = 0, referral = 0, swap = 0, total = 0, visible } = state;
  const [messageApi, contextHolder] = message.useMessage();
  const { hash } = useLocation();
  const { seasonInfo } = useBaseContext();
  const goBack = useGoBack();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const copyImageToClipboard = async (blob: Blob) => {
    try {
      messageApi.open({
        type: "success",
        content: t(constantKeys.SUCCESSFUL_COPY_IMAGE),
      });
      const clipboardItem = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([clipboardItem]);
    } catch (error) {
      console.error("Error :", error);
    }
  };

  const cropCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let top: number | null = null,
      bottom: number | null = null,
      left: number | null = null,
      right: number | null = null;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = pixels[idx + 3];

        if (alpha !== 0) {
          if (top === null) top = y;
          bottom = y;
          if (left === null || x < left) left = x;
          if (right === null || x > right) right = x;
        }
      }
    }

    if (top === null || bottom === null || left === null || right === null) {
      return canvas;
    }

    const padding = 5;
    const cropLeft = Math.min(Math.max(left + padding, 0), width - 1);
    const cropTop = Math.min(Math.max(top + padding, 0), height - 1);
    const cropRight = Math.max(Math.min(right - padding, width - 1), cropLeft);
    const cropBottom = Math.max(
      Math.min(bottom - padding, height - 1),
      cropTop
    );

    const croppedWidth = cropRight - cropLeft + 1;
    const croppedHeight = cropBottom - cropTop + 1;

    const newCanvas = document.createElement("canvas");
    newCanvas.width = croppedWidth;
    newCanvas.height = croppedHeight;

    const newCtx = newCanvas.getContext("2d");
    if (!newCtx) return canvas;

    const croppedImageData = ctx.getImageData(
      cropLeft,
      cropTop,
      croppedWidth,
      croppedHeight
    );
    newCtx.putImageData(croppedImageData, 0, 0);

    return newCanvas;
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current);
      const croppedCanvas = cropCanvas(canvas);

      croppedCanvas.toBlob((blob) => {
        if (!blob) return;

        const file = new File([blob], "achievements.png", {
          type: "image/png",
        });

        copyImageToClipboard(file);
      }, "image/png");
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  };

  useEffect(() => {
    switch (hash) {
      case `#${constantModals.SHARE_ACHIEVEMENTS}`: {
        if (vault) {
          setState((prevState) => ({
            ...prevState,
            referral: calcReferralMultiplier(vault.referralCount),
            swap: calcSwapMultiplier(vault.swapVolume),
            visible: true,
          }));

          api
            .leaderboard({ from: 0, limit: 1, season: "0" })
            .then(({ data: { totalVaultCount } }) => {
              const currentSeason = getCurrentSeason(seasonInfo);

              setState((prevState) => ({
                ...prevState,
                rank: getActivity(
                  vault,
                  currentSeason?.id ? parseInt(currentSeason.id) : 0
                ).rank,
                total: totalVaultCount,
              }));
            })
            .catch(() => {});
        } else {
          setState((prevState) => ({ ...prevState, visible: true }));
        }

        break;
      }
      default: {
        setState({});

        break;
      }
    }
  }, [hash]);

  return (
    <>
      <Modal
        centered={true}
        classNames={{ body: "modal-achievements" }}
        footer={false}
        maskClosable={false}
        onCancel={() => goBack()}
        open={visible}
        styles={{ footer: { display: "none" } }}
        title={t(constantKeys.SHARE_ACHIEVEMENTS)}
        width={500}
      >
        <div ref={cardRef} className="card">
          <div className="logo">
            <Vultisig />
            <span>Vultisig</span>
          </div>
          <div className="rank">
            <span className="title">
              {t(constantKeys.SHARE_ACHIEVEMENT_TEXT)}
            </span>
            <span className="value">
              {total > 0 ? `${rank} of ${total}` : <Spin size="small" />}
            </span>
          </div>
          <div className="stats">
            <div className="item">
              <span className="title">{t(constantKeys.SWAP_MULTIPLIER)}</span>
              <span className="multiplier">{`${swap.toBalanceFormat(
                3
              )}X`}</span>
            </div>
            <div className="item">
              <span className="title">
                {t(constantKeys.REFERRAL_MULTIPLIER)}
              </span>
              <span className="multiplier">{`${referral.toBalanceFormat(
                3
              )}X`}</span>
            </div>
          </div>
        </div>

        <List.Item onClick={handleShare}>
          <CopyOutlined />
          <span>{t(constantKeys.COPY_IMAGE_TO_CLIPBOARD)}</span>
        </List.Item>
      </Modal>
      {contextHolder}
    </>
  );
};

export default Component;
