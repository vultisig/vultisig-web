import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MenuProps } from "antd";

import { Language, LayoutKey, languageName } from "utils/constants";
import { VaultProps, SeasonInfo } from "utils/interfaces";
import { getCurrentSeason, handleSeasonPath } from "utils/functions";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import {
  ArrowRight,
  CircleDollar,
  CircleHelp,
  ChromeExtension,
  ExternalLink,
  Globe,
  Handshake,
  RadioWave,
  Settings,
  Storage,
  Vultisig,
} from "icons";

interface UseMenuItemsProps {
  layout: LayoutKey;
  vault?: VaultProps;
  vaults: VaultProps[];
  currency: string;
  language: Language;
  seasonInfo: SeasonInfo[];
  onShare: () => void;
  getVaultBalance: () => string;
}

export const useMenuItems = ({
  layout,
  vault,
  vaults,
  currency,
  language,
  seasonInfo,
  onShare,
  getVaultBalance,
}: UseMenuItemsProps) => {
  const { t } = useTranslation();

  const handleSharePath = useCallback(
    (path: string): string => {
      return path
        .replace(":alias", (vault?.alias || "").replace(/ /g, "-"))
        .replace(":uid", vault?.uid || "");
    },
    [vault]
  );

  const dropdownMenu: MenuProps["items"] = useMemo(
    () => [
      {
        key: "0",
        type: "group",
        label: t(constantKeys.VAULT_BALANCE),
        children: [
          ...(layout === LayoutKey.VAULT
            ? [
                {
                  key: "0-1",
                  label: <span className="balance">{getVaultBalance()}</span>,
                  icon: <Storage className="icon" />,
                },
              ]
            : []),
        ],
      },
      ...(layout === LayoutKey.VAULT
        ? [
            {
              key: "1",
              label: (
                <Link to={`#${constantModals.VAULT_SETTINGS}`} state={true}>
                  {t(constantKeys.VAULT_SETTINGS)}
                </Link>
              ),
              icon: <Settings />,
            },
          ]
        : []),
      {
        key: "2",
        label: (
          <>
            <Link to={`#${constantModals.CHANGE_LANG}`} state={true}>
              {t(constantKeys.LANGUAGE)}
            </Link>
            <span>{languageName[language]}</span>
          </>
        ),
        icon: <Globe />,
      },
      ...(layout !== LayoutKey.DEFAULT
        ? [
            {
              key: "3",
              label: (
                <>
                  <Link to={`#${constantModals.CHANGE_CURRENCY}`} state={true}>
                    {t(constantKeys.CURRENCY)}
                  </Link>
                  <span>{currency}</span>
                </>
              ),
              icon: <CircleDollar />,
            },
          ]
        : []),
      {
        key: "5",
        label: (
          <a
            href="https://vultisig.com/faq"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t(constantKeys.FAQ)}
          </a>
        ),
        icon: <CircleHelp />,
      },
      {
        key: "6",
        type: "group",
        label: t(constantKeys.OTHER),
        children: [
          ...(layout === LayoutKey.VAULT
            ? [
                {
                  key: "6-1",
                  label: (
                    <Link to={`#${constantModals.REFERRAL_CODE}`} state={true}>
                      {t(constantKeys.REFERRAL_CODE)}
                    </Link>
                  ),
                  icon: <Handshake />,
                },
                {
                  key: "6-2",
                  label: (
                    <Link to={`#${constantModals.MANAGE_AIRDROP}`} state={true}>
                      {t(constantKeys.MANAGE_AIRDROP)}
                    </Link>
                  ),
                  icon: <RadioWave />,
                },
              ]
            : []),
          {
            key: "6-3",
            label: (
              <a
                href="https://vultisig.com/vult"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t(constantKeys.VULT_TOKEN)}
              </a>
            ),
            icon: <Vultisig />,
          },
          {
            key: "6-4",
            label: (
              <a
                href="https://chromewebstore.google.com/detail/vulticonnect/ggafhcdaplkhmmnlbfjpnnkepdfjaelb"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t(constantKeys.CHROME_EXTENSION)}
              </a>
            ),
            icon: <ChromeExtension />,
          },
          ...(layout === LayoutKey.VAULT
            ? [
                {
                  key: "6-5",
                  label: t(constantKeys.SHARE_VAULT),
                  icon: <ExternalLink />,
                  onClick: onShare,
                },
              ]
            : []),
        ],
      },
    ],
    [layout, vault, currency, language, t, onShare, getVaultBalance]
  );

  const firstItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "1",
        label: t(constantKeys.BALANCES),
        icon: <ArrowRight />,
        type: "submenu",
        children: [
          {
            key: "1-1",
            label: (
              <Link
                to={
                  layout === LayoutKey.SHARED
                    ? handleSharePath(constantPaths.shared.chains)
                    : constantPaths.vault.chains
                }
              >
                {t(constantKeys.ASSETS)}
              </Link>
            ),
          },
          {
            key: "1-2",
            label: (
              <Link
                to={
                  layout === LayoutKey.SHARED
                    ? handleSharePath(constantPaths.shared.nfts)
                    : constantPaths.vault.nfts
                }
              >
                {t(constantKeys.NFTS)}
              </Link>
            ),
          },
          {
            key: "1-3",
            label: (
              <Link
                to={
                  layout === LayoutKey.SHARED
                    ? handleSharePath(constantPaths.shared.positions)
                    : constantPaths.vault.positions
                }
              >
                {t(constantKeys.POSITIONS)}
              </Link>
            ),
          },
        ],
      },
    ],
    [layout, handleSharePath, t]
  );

  const lastItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "4",
        label: (
          <Link to={constantPaths.default.onboarding}>
            {t(constantKeys.HOW_TO_PARTICIPATE)}
          </Link>
        ),
      },
      {
        key: "5",
        label: (
          <Link to={constantPaths.default.import}>
            {t(constantKeys.CONNECT_YOUR_WALLET)}
          </Link>
        ),
      },
    ],
    [t]
  );

  const navbarMenu: MenuProps["items"] = useMemo(
    () => [
      ...(vaults.length || layout === LayoutKey.SHARED ? firstItems : []),
      {
        key: "8",
        label: t(constantKeys.CURRENT_SEASON),
        icon: <ArrowRight />,
        type: "submenu",
        children: [
          {
            key: `8-1`,
            label: (
              <Link
                to={
                  layout === LayoutKey.SHARED
                    ? handleSeasonPath(
                        handleSharePath(constantPaths.shared.airdrop),
                        `${getCurrentSeason(seasonInfo)?.id}`
                      )
                    : vaults.length
                    ? handleSeasonPath(
                        constantPaths.vault.airdrop,
                        `${getCurrentSeason(seasonInfo)?.id}`
                      )
                    : handleSeasonPath(
                        constantPaths.default.airdrop,
                        `${getCurrentSeason(seasonInfo)?.id}`
                      )
                }
              >
                {t(constantKeys.AIRDROP_LEADERBOARD)}
              </Link>
            ),
          },
          {
            key: "7",
            label: (
              <Link
                to={
                  layout === LayoutKey.SHARED
                    ? handleSharePath(constantPaths.shared.swap)
                    : vaults.length
                    ? constantPaths.vault.swap
                    : constantPaths.default.swap
                }
              >
                {t(constantKeys.SWAP)}
              </Link>
            ),
          },
          ...(vaults.length
            ? [
                {
                  key: "3",
                  label: (
                    <Link to={constantPaths.vault.achievements}>
                      {t(constantKeys.ACHIEVEMENTS)}
                    </Link>
                  ),
                },
              ]
            : []),
        ],
      },
      {
        key: "2",
        label: t(constantKeys.PAST_SEASONS),
        icon: <ArrowRight />,
        type: "submenu",
        children: seasonInfo
          .filter((season) => new Date(season.end) < new Date())
          .map((_season, index) => ({
            key: `2-${index}`,
            label: (
              <Link
                to={
                  layout === LayoutKey.SHARED
                    ? handleSeasonPath(
                        handleSharePath(constantPaths.shared.airdrop),
                        `${index}`
                      )
                    : vaults.length
                    ? handleSeasonPath(constantPaths.vault.airdrop, `${index}`)
                    : handleSeasonPath(constantPaths.default.airdrop, `${index}`)
                }
              >
                {`Season ${index}`}
              </Link>
            ),
          })),
      },
      ...(!vaults.length ? lastItems : []),
    ],
    [
      vaults.length,
      layout,
      firstItems,
      lastItems,
      seasonInfo,
      handleSharePath,
      t,
    ]
  );

  return {
    dropdownMenu,
    navbarMenu,
    handleSharePath,
  };
};

