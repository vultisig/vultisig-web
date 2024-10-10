import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Dropdown, MenuProps, message } from "antd";
import { useTranslation } from "react-i18next";
import MediaQuery from "react-responsive";

import { useBaseContext } from "context/base";
import { Language, languageName } from "utils/constants";
import i18n from "i18n/config";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import { Vultisig } from "icons";

import {
  ChainOutlined,
  CurrencyOutlined,
  GearOutlined,
  GlobeOutlined,
  QuestionOutlined,
  ShareOutlined,
  UserOutlined,
} from "icons";

interface ComponentProps {
  uid?: string;
  alias?: string;
  logo?: string;
}

const Component: FC<ComponentProps> = ({ uid, alias, logo }) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const { currency } = useBaseContext();
  const { pathname } = useLocation();
  let language: Language;

  const handleShare = (): void => {
    navigator.clipboard
      .writeText(`${location.origin}/shared/vault/${alias}/${uid}`)
      .then(() => {
        messageApi.open({
          type: "success",
          content: t(translation.SUCCESSFUL_COPY_LINK),
        });
      })
      .catch(() => {
        messageApi.open({
          type: "error",
          content: t(translation.UNSUCCESSFUL_COPY_LINK),
        });
      });
  };

  switch (i18n.language) {
    case Language.CROATIA:
      language = Language.CROATIA;
      break;
    case Language.DUTCH:
      language = Language.DUTCH;
      break;
    case Language.GERMAN:
      language = Language.GERMAN;
      break;
    case Language.ITALIAN:
      language = Language.ITALIAN;
      break;
    case Language.PORTUGUESE:
      language = Language.PORTUGUESE;
      break;
    case Language.RUSSIAN:
      language = Language.RUSSIAN;
      break;
    case Language.SPANISH:
      language = Language.SPANISH;
      break;
    default:
      language = Language.ENGLISH;
      break;
  }

  const items: MenuProps["items"] = [
    ...(uid
      ? [
          {
            key: "1",
            label: (
              <Link to={`#${constantModals.VAULT_SETTINGS}`} state={true}>
                {t(translation.VAULT_SETTINGS)}
              </Link>
            ),
            icon: <GearOutlined />,
          },
        ]
      : []),
    {
      key: "2",
      label: (
        <>
          <Link to={`#${constantModals.CHANGE_LANG}`} state={true}>
            {t(translation.LANGUAGE)}
          </Link>
          <span>{languageName[language]}</span>
        </>
      ),
      icon: <GlobeOutlined />,
    },
    {
      key: "3",
      label: (
        <>
          <Link to={`#${constantModals.CHANGE_CURRENCY}`} state={true}>
            {t(translation.CURRENCY)}
          </Link>
          <span>{currency}</span>
        </>
      ),
      icon: <CurrencyOutlined />,
    },
    ...(uid
      ? [
          {
            key: "4",
            label: t(translation.DEFAULT_CHAINS),
            icon: <ChainOutlined />,
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
          {t(translation.FAQ)}
        </a>
      ),
      icon: <QuestionOutlined />,
    },
    {
      key: "6",
      type: "group",
      label: t(translation.OTHER),
      children: [
        {
          key: "6-1",
          label: (
            <a
              href="https://vultisig.com/vult"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t(translation.VULT_TOKEN)}
            </a>
          ),
          icon: <img src="/images/logo.svg" alt="logo" />,
        },
        ...(uid
          ? [
              {
                key: "6-2",
                label: t(translation.SHARE_VAULT),
                icon: <ShareOutlined />,
                onClick: () => handleShare(),
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <>
      <div className="layout-header">
        <Dropdown menu={{ items }} className="menu">
          <Button type="link">
            <UserOutlined />
          </Button>
        </Dropdown>

        <Link to={constantPaths.root} className="logo">
          {uid ? (
            <>
              <Vultisig className="shape" />

              <span className="name">Vultisig</span>
            </>
          ) : (
            <>
              {logo ? (
                <img className="shape" src={logo} />
              ) : (
                <Vultisig className="shape" />
              )}

              <span className="name">{alias}</span>
            </>
          )}
        </Link>

        {uid && (
          <MediaQuery minWidth={992}>
            <div className="navbar">
              <Link
                to={constantPaths.vault.chains}
                className={`${
                  pathname.startsWith(constantPaths.vault.chains)
                    ? "active"
                    : ""
                }`}
              >
                Balances
              </Link>
              <Link
                to={constantPaths.vault.positions}
                className={`${
                  pathname === constantPaths.vault.positions ? "active" : ""
                }`}
              >
                Active Positions
              </Link>
              <Link
                to={constantPaths.vault.leaderboard}
                className={`${
                  pathname === constantPaths.vault.leaderboard ? "active" : ""
                }`}
              >
                Airdrop Leaderboard
              </Link>
            </div>
          </MediaQuery>
        )}
      </div>

      {contextHolder}
    </>
  );
};

export default Component;
