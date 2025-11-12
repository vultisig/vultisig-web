import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import { VaultProps } from "utils/interfaces";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";

interface UseShareVaultProps {
  vault?: VaultProps;
}

export const useShareVault = ({ vault }: UseShareVaultProps) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const handleShare = useCallback(() => {
    if (!vault) return;

    const sharePath = constantPaths.shared.chains
      .replace(":alias", (vault.alias || "").replace(/ /g, "-"))
      .replace(":uid", vault.uid || "");

    const shareUrl = `${location.origin}${sharePath}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        messageApi.open({
          type: "success",
          content: t(constantKeys.SUCCESSFUL_COPY_LINK),
        });
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
        messageApi.open({
          type: "error",
          content: t(constantKeys.UNSUCCESSFUL_COPY_LINK),
        });
      });
  }, [vault, messageApi, t]);

  return {
    handleShare,
    contextHolder,
  };
};

