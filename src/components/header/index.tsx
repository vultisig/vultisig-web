import { FC, Fragment, useEffect, useState } from "react";
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

import { useBaseContext } from "context";
import { Language, languageName, LayoutKey, PageKey } from "utils/constants";
import useGoBack from "hooks/go-back";
import i18n from "i18n/config";
import translation from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import { ChromeExtension, Vultisig } from "icons";

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
  uid: string;
  alias: string;
  layout: LayoutKey;
  logo: string;
}

interface InitialState {
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ alias, layout, logo, uid }) => {
  const { t } = useTranslation();
  const initialState: InitialState = { visible: false };
  const [state, setState] = useState(initialState);
  const { visible } = state;
  const [messageApi, contextHolder] = message.useMessage();
  const { activePage, currency } = useBaseContext();
  const { hash } = useLocation();
  const goBack = useGoBack();

  const handleSharePath = (path: string): string => {
    return path
      .replace(":alias", alias.replace(/ /g, "-"))
      .replace(":uid", uid);
  };

  const handleShare = (): void => {
    navigator.clipboard
      .writeText(
        `${location.origin}${handleSharePath(constantPaths.shared.chainsAlias)}`
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

  const navbarItems = [
    ...[
      <Link
        to={
          layout === LayoutKey.VAULT
            ? constantPaths.vault.chains
            : handleSharePath(constantPaths.shared.chainsAlias)
        }
        className={`${
          activePage === PageKey.ASSETS ||
          activePage === PageKey.CHAINS ||
          activePage === PageKey.SHARED_ASSETS ||
          activePage === PageKey.SHARED_CHAINS
            ? "active"
            : ""
        }`}
      >
        Balances
      </Link>,
      <Link
        to={
          layout === LayoutKey.VAULT
            ? constantPaths.vault.positions
            : handleSharePath(constantPaths.shared.positions)
        }
        className={`${
          activePage === PageKey.POSITIONS ||
          activePage === PageKey.SHARED_POSITIONS
            ? "active"
            : ""
        }`}
      >
        Active Positions
      </Link>,
    ],
    ...(layout === LayoutKey.VAULT
      ? [
          <Link
            to={constantPaths.vault.leaderboard}
            className={`${activePage === PageKey.LEADERBOARD ? "active" : ""}`}
          >
            Airdrop Leaderboard
          </Link>,
        ]
      : []),
  ];

  const dropdownMenu: MenuProps["items"] = [
    ...(layout === LayoutKey.VAULT
      ? [
          {
            key: "1",
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
      key: "2",
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
      key: "3",
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
    // ...(layout === LayoutKey.VAULT
    //   ? [
    //       {
    //         key: "4",
    //         label: t(translation.DEFAULT_CHAINS),
    //         icon: <ChainOutlined />,
    //       },
    //     ]
    //   : []),
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
      icon: <CircleHelp />,
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
        {
          key: "6-2",
          label: (
            <a
              href="https://chromewebstore.google.com/detail/vulticonnect/ggafhcdaplkhmmnlbfjpnnkepdfjaelb"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t(translation.CHROME_EXTENSION)}
            </a>
          ),
          icon: <ChromeExtension />,
        },
        ...(layout === LayoutKey.VAULT
          ? [
              {
                key: "6-3",
                label: t(translation.SHARE_VAULT),
                icon: <ExternalLink />,
                onClick: () => handleShare(),
              },
            ]
          : []),
      ],
    },
  ];

  const navbarMenu: MenuProps["items"] = navbarItems.map((item, ind) => ({
    key: `${ind + 1}`,
    label: item,
  }));

  return (
    <>
      <div className="layout-header">
        {isDesktop ? (
          <Dropdown menu={{ items: dropdownMenu }} className="menu">
            <Button type="link">
              <CircleUser />
            </Button>
          </Dropdown>
        ) : (
          <Button href={`#${constantModals.MENU}`} type="link" className="menu">
            <HamburgerLG />
          </Button>
        )}

        {layout === LayoutKey.VAULT && (
          <Button href={`#${constantModals.JOIN_AIRDROP}`} className="airdrop">
            {t(translation.JOIN_AIRDROP)}
          </Button>
        )}

        <Link
          to={
            layout === LayoutKey.VAULT
              ? constantPaths.vault.chains
              : handleSharePath(constantPaths.shared.chainsAlias)
          }
          className="logo"
        >
          {layout === LayoutKey.VAULT ? (
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

        {isDesktop && (
          <>
            <div className="navbar">
              {navbarItems.map((item, index) => (
                <Fragment key={index}>{item}</Fragment>
              ))}
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
              {layout === LayoutKey.VAULT ? (
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
          <Menu items={navbarMenu} selectedKeys={[]} />
          <Divider />
          <Menu items={dropdownMenu} selectedKeys={[]} />
        </Drawer>
      )}

      {contextHolder}
    </>
  );
};

export default Component;
