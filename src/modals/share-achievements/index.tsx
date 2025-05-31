import { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Modal, message, List } from "antd";

import { Vultisig } from "icons";
import { CopyOutlined } from "@ant-design/icons";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import useGoBack from "hooks/go-back";
import html2canvas from "html2canvas";
import { VaultProps, SeasonInfo, Milestones } from "utils/interfaces";
import {
  calcSwapMultiplier,
  calcReferralMultiplier,
  getCurrentSeason,
  getCurrentSeasonVulties,
} from "utils/functions";
import { useBaseContext } from "context";

interface InitialState {
  visible: boolean;
  referralMultiplier: number;
  swapMultiplier: number;
  currentSeasonInfo?: SeasonInfo;
  currentSeasonPoints: number;
}

interface ModalProps {
  vault: VaultProps;
}

const Component: FC<ModalProps> = ({ vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = {
    visible: false,
    referralMultiplier: 0,
    swapMultiplier: 0,
    currentSeasonPoints: 0,
  };
  const [state, setState] = useState(initialState);
  const [messageApi, contextHolder] = message.useMessage();
  const {
    visible,
    swapMultiplier,
    referralMultiplier,
    currentSeasonInfo,
    currentSeasonPoints,
  } = state;
  const { hash } = useLocation();
  const { seasonInfo, milestonesSteps } = useBaseContext();
  const goBack = useGoBack();

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.SHARE_ACHIEVEMENTS}`: {
        setState((prevState) => ({ ...prevState, visible: true }));

        break;
      }
      default: {
        setState(initialState);

        break;
      }
    }

    if (vault) {
      setState((prevState) => ({
        ...prevState,
        swapMultiplier: calcSwapMultiplier(vault.swapVolume),
        referralMultiplier: calcReferralMultiplier(vault.referralCount),
        currentSeasonInfo: getCurrentSeason(seasonInfo),
        currentSeasonPoints: getCurrentSeasonVulties(vault, seasonInfo),
      }));
    }
  };

  useEffect(componentDidUpdate, [hash]);

  const handleShare = async () => {
    const element = document.querySelector(
      ".achievements-info"
    ) as HTMLElement | null;
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
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

  const getMilestoneIndex = (value: number, milestones: Milestones[]): number => {
    if (!milestones || milestones.length === 0) return -1;
    if (value > milestones[milestones.length - 1].minimum) return milestones.length - 1;

    for (let i = milestones.length - 1; i >= 0; i--) {
      if (value >= milestones[i].minimum) {
        return i;
      }
    }
    return -1;
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
    const cropBottom = Math.max(Math.min(bottom - padding, height - 1), cropTop);
  
    const croppedWidth = cropRight - cropLeft + 1;
    const croppedHeight = cropBottom - cropTop + 1;
  
    const newCanvas = document.createElement("canvas");
    newCanvas.width = croppedWidth;
    newCanvas.height = croppedHeight;
  
    const newCtx = newCanvas.getContext("2d");
    if (!newCtx) return canvas;
  
    const croppedImageData = ctx.getImageData(cropLeft, cropTop, croppedWidth, croppedHeight);
    newCtx.putImageData(croppedImageData, 0, 0);
  
    return newCanvas;
  };
  
  return (
    <Modal
      className="modal-achievements"
      title={t(constantKeys.SHARE_ACHIEVEMENTS)}
      centered={true}
      footer={false}
      onCancel={() => goBack()}
      maskClosable={false}
      open={visible}
      width={495}
    >
      <div className="achievements-info">
        <div className="logo">
          <Vultisig className="shape" />
          <span className="name">Vultisig</span>
        </div>
        <div className="share-vult">
          <div className="share-info">
            <span
              className="title"
              dangerouslySetInnerHTML={{
                __html: t(
                  constantKeys.MY_SHARE_OF_THE_VULT_AIRDROP
                ).replaceArgs(["<span>$VULT</span>"]),
              }}
            ></span>
            <span className="total-vulties">
              {t(constantKeys.TOTAL_VULTIES)}
            </span>
            <span className="total-vulties-numder">
              {currentSeasonPoints.toNumberFormat()}
            </span>
          </div>
          {!(
            currentSeasonPoints <
            (currentSeasonInfo?.milestones
              ? currentSeasonInfo?.milestones[0].minimum
              : 0)
          ) ? (
            <img
              className="img"
              src={
                milestonesSteps[
                  getMilestoneIndex(
                    currentSeasonPoints,
                    currentSeasonInfo?.milestones
                      ? currentSeasonInfo?.milestones
                      : []
                  )
                ]
              }
              alt="share-achievements"
            />
          ) : null}
        </div>
        <ul className="swap-info">
          <li>
            <span className="title">{t(constantKeys.SWAP_VOLUME)}</span>
            <span className="number">{`$ ${vault.swapVolume.toNumberFormat()}`}</span>
          </li>
          <li>
            <span className="title">{t(constantKeys.SWAP_MULTIPLIER)}</span>
            <span className="multiplier">{`${swapMultiplier.toBalanceFormat(
              3
            )}X`}</span>
          </li>
          <li>
            <span className="title">{t(constantKeys.REFERRAL_MULTIPLIER)}</span>
            <span className="multiplier">{`${referralMultiplier.toBalanceFormat(
              3
            )}X`}</span>
          </li>
        </ul>
      </div>

      <List.Item
        className="contact-links link"
        style={{ backgroundColor: `#03A9F4` }}
        onClick={() => handleShare()}
      >
        <CopyOutlined />
        <span>{t(constantKeys.COPY_IMAGE_TO_CLIPBOARD)}</span>
      </List.Item>

      {contextHolder}
    </Modal>
  );
};

export default Component;
