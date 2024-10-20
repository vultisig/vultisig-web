import { FC, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Button,
  Divider,
  Drawer,
  Dropdown,
  Menu,
  MenuProps,
  message,
} from "antd";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";

import { useBaseContext } from "context/base";
import { Language, languageName } from "utils/constants";
import useGoBack from "hooks/go-back";
import i18n from "i18n/config";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import { Vultisig } from "icons";

import {
  CircleDollar,
  CircleHelp,
  CircleUser,
  ExternalLink,
  Globe,
  HamburgerLG,
  Settings,
} from "icons";

interface ComponentProps {
  uid?: string;
  alias?: string;
  logo?: string;
}

interface InitialState {
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ uid, alias, logo }) => {
  const { t } = useTranslation();
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const { visible } = state;
  const [messageApi, contextHolder] = message.useMessage();
  const { currency } = useBaseContext();
  const { hash, pathname } = useLocation();
  const goBack = useGoBack();

  const handleShare = (): void => {
    navigator.clipboard
      .writeText(
        `${location.origin}/shared/vault/${(alias ?? "").replace(
          / /g,
          "-"
        )}/${uid}`
      )
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

  const componentDidUpdate = (): void => {
    switch (hash) {
      case `#${constantModals.MENU}`: {
        setState((prevState) => ({ ...prevState, visible: true }));

        break;
      }
      default: {
        setState(initialState);

        break;
      }
    }
  };

  useEffect(componentDidUpdate, [hash]);

  let language: Language;

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

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });
  const items: MenuProps["items"] = [
    ...(uid
      ? [
          {
            key: "4",
            label: (
              <Link to={`#${constantModals.VAULT_SETTINGS}`} state={true}>
                {t(translation.VAULT_SETTINGS)}
              </Link>
            ),
            icon: <Settings />,
          },
        ]
      : []),
    {
      key: "5",
      label: (
        <>
          <Link to={`#${constantModals.CHANGE_LANG}`} state={true}>
            {t(translation.LANGUAGE)}
          </Link>
          <span>{languageName[language]}</span>
        </>
      ),
      icon: <Globe />,
    },
    {
      key: "6",
      label: (
        <>
          <Link to={`#${constantModals.CHANGE_CURRENCY}`} state={true}>
            {t(translation.CURRENCY)}
          </Link>
          <span>{currency}</span>
        </>
      ),
      icon: <CircleDollar />,
    },
    // ...(uid
    //   ? [
    //       {
    //         key: "7",
    //         label: t(translation.DEFAULT_CHAINS),
    //         icon: <ChainOutlined />,
    //       },
    //     ]
    //   : []),
    {
      key: "8",
      label: (
        <a
          href="https://vultisig.com/faq"
          rel="noopener noreferrer"
          target="_blank"
        >
          {t(translation.FAQ)}
        </a>
      ),
      icon: <CircleHelp />,
    },
    {
      key: "9",
      type: "group",
      label: t(translation.OTHER),
      children: [
        {
          key: "9-1",
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
                key: "9-2",
                label: t(translation.SHARE_VAULT),
                icon: <ExternalLink />,
                onClick: () => handleShare(),
              },
            ]
          : []),
      ],
    },
  ];

  const menu: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Link
          to={constantPaths.vault.chains}
          className={`${
            pathname.startsWith(constantPaths.vault.chains) ? "active" : ""
          }`}
        >
          Balances
        </Link>
      ),
    },
    {
      key: "2",
      label: (
        <Link
          to={constantPaths.vault.positions}
          className={`${
            pathname === constantPaths.vault.positions ? "active" : ""
          }`}
        >
          Active Positions
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Link
          to={constantPaths.vault.leaderboard}
          className={`${
            pathname === constantPaths.vault.leaderboard ? "active" : ""
          }`}
        >
          Airdrop Leaderboard
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="layout-header">
        {isDesktop ? (
          <Dropdown menu={{ items }} className="menu">
            <Button type="link">
              <CircleUser />
            </Button>
          </Dropdown>
        ) : (
          <Button href={`#${constantModals.MENU}`} type="link" className="menu">
            <HamburgerLG />
          </Button>
        )}

        {uid && (
          <Button href={`#${constantModals.JOIN_AIRDROP}`} className="airdrop">
            {t(translation.JOIN_AIRDROP)}
          </Button>
        )}

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

        {isDesktop && uid && (
          <>
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
          </>
        )}
      </div>

      {!isDesktop && (
        <Drawer
          footer={false}
          onClose={() => goBack()}
          title={
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
          }
          closeIcon={false}
          open={visible}
          width={320}
          placement="left"
          className="layout-menu"
        >
          {uid && (
            <>
              <Menu items={menu} selectedKeys={[]} />
              <Divider />
            </>
          )}
          <Menu items={items} selectedKeys={[]} />
        </Drawer>
      )}

      {contextHolder}
    </>
  );
};

export default Component;
