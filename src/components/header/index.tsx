import { FC, Fragment, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import {
  Button,
  Divider,
  Drawer,
  Dropdown,
  Menu,
  MenuProps,
  message,
} from "antd";

import { useBaseContext } from "context";
import { Language, languageName, LayoutKey, PageKey } from "utils/constants";
import api from "utils/api";
import useGoBack from "hooks/go-back";
import i18n from "i18n/config";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import {
  CircleDollar,
  CircleHelp,
  CircleUser,
  ChromeExtension,
  ExternalLink,
  Globe,
  HamburgerLG,
  Settings,
  Vultisig,
  RadioWave,
} from "icons";
import { getStoredVaults } from "utils/storage";
import { VaultProps } from "utils/interfaces";

interface ComponentProps {
  updateVault?: (vault: VaultProps) => void;
  layout: LayoutKey;
  vault?: VaultProps;
}

interface InitialState {
  loading: boolean;
  visible: boolean;
}

const Component: FC<ComponentProps> = ({ updateVault, layout, vault }) => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false, visible: false };
  const [state, setState] = useState(initialState);
  const { loading, visible } = state;
  const { activePage, currency } = useBaseContext();
  const [messageApi, contextHolder] = message.useMessage();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const vaults = getStoredVaults();

  const handleJoinAirdrop = () => {
    if (vault && !loading) {
      setState((prevState) => ({ ...prevState, loading: true }));

      api.airdrop
        .join(vault)
        .then(() => {
          if (updateVault) updateVault({ ...vault, joinAirdrop: true });

          setState((prevState) => ({ ...prevState, loading: false }));

          navigate(`${pathname}#${constantModals.JOIN_AIRDROP}`, {
            replace: true,
          });
        })
        .catch(() => {
          setState((prevState) => ({ ...prevState, loading: false }));
        });
    }
  };

  const handleSharePath = (path: string): string => {
    return path
      .replace(":alias", (vault?.alias ?? "").replace(/ /g, "-"))
      .replace(":uid", vault?.uid ?? "");
  };

  const handleShare = (): void => {
    navigator.clipboard
      .writeText(
        `${location.origin}${handleSharePath(constantPaths.shared.chains)}`
      )
      .then(() => {
        messageApi.open({
          type: "success",
          content: t(constantKeys.SUCCESSFUL_COPY_LINK),
        });
      })
      .catch(() => {
        messageApi.open({
          type: "error",
          content: t(constantKeys.UNSUCCESSFUL_COPY_LINK),
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
      ...(vaults.length
        ? [
            <Link
              to={
                layout === LayoutKey.SHARED
                  ? handleSharePath(constantPaths.shared.chains)
                  : constantPaths.vault.chains
              }
              className={`${
                activePage === PageKey.SHARED_CHAINS ||
                activePage === PageKey.SHARED_CHAIN_ASSETS ||
                activePage === PageKey.VAULT_CHAINS ||
                activePage === PageKey.VAULT_CHAIN_ASSETS
                  ? "active"
                  : ""
              }`}
            >
              {t(constantKeys.BALANCES)}
            </Link>,
            <Link
              to={
                layout === LayoutKey.SHARED
                  ? handleSharePath(constantPaths.shared.nfts)
                  : constantPaths.vault.nfts
              }
              className={`${
                activePage === PageKey.SHARED_NFTS ||
                activePage === PageKey.SHARED_NFT_ASSETS ||
                activePage === PageKey.VAULT_NFTS ||
                activePage === PageKey.VAULT_NFT_ASSETS
                  ? "active"
                  : ""
              }`}
            >
              {t(constantKeys.NFTS)}
            </Link>,
            <Link
              to={
                layout === LayoutKey.SHARED
                  ? handleSharePath(constantPaths.shared.positions)
                  : constantPaths.vault.positions
              }
              className={`${
                activePage === PageKey.SHARED_POSITIONS ||
                activePage === PageKey.VAULT_POSITIONS
                  ? "active"
                  : ""
              }`}
            >
              {t(constantKeys.ACTIVE_POSITIONS)}
            </Link>,
          ]
        : []),
      <Link
        to={
          layout === LayoutKey.SHARED
            ? handleSharePath(constantPaths.shared.leaderboard)
            : vaults.length
            ? constantPaths.vault.leaderboard
            : constantPaths.default.leaderboard
        }
        className={`${
          activePage === PageKey.LEADERBOARD ||
          activePage === PageKey.SHARED_LEADERBOARD ||
          activePage === PageKey.VAULT_LEADERBOARD
            ? "active"
            : ""
        }`}
      >
        {t(constantKeys.AIRDROP_LEADERBOARD)}
      </Link>,
      ...(!vaults.length
        ? [
            <Link
              to={constantPaths.default.onboarding}
              className={`${activePage === PageKey.ONBOARDING ? "active" : ""}`}
            >
              {t(constantKeys.HOW_TO_PARTICIPATE)}
            </Link>,
            <Link
              to={constantPaths.default.import}
              className={`${
                activePage === PageKey.IMPORT || activePage === PageKey.UPLOAD
                  ? "active"
                  : ""
              }`}
            >
              {t(constantKeys.CONNECT_YOUR_WALLET)}
            </Link>,
          ]
        : []),
    ],
  ];

  const dropdownMenu: MenuProps["items"] = [
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
          // ...(layout === LayoutKey.VAULT
          //   ? [
          //       {
          //         key: "4",
          //         label: t(constantKeys.DEFAULT_CHAINS),
          //         icon: <ChainOutlined />,
          //       },
          //     ]
          //   : []),
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
        {
          key: "6-1",
          label: (
            <Link to={`#${constantModals.MANAGE_AIRDROP}`} state={true}>
              {t(constantKeys.MANAGE_AIRDROP)}
            </Link>
          ),
          icon: <RadioWave />,
        },
        {
          key: "6-2",
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
          key: "6-3",
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
                key: "6-4",
                label: t(constantKeys.SHARE_VAULT),
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
              {layout === LayoutKey.DEFAULT ? <HamburgerLG /> : <CircleUser />}
            </Button>
          </Dropdown>
        ) : (
          <Button href={`#${constantModals.MENU}`} type="link" className="menu">
            <HamburgerLG />
          </Button>
        )}

        {layout === LayoutKey.VAULT && !vault?.joinAirdrop && (
          <Button
            onClick={handleJoinAirdrop}
            loading={isDesktop && loading}
            className="airdrop"
          >
            {t(constantKeys.JOIN_AIRDROP)}
          </Button>
        )}

        <Link
          to={
            layout === LayoutKey.SHARED
              ? handleSharePath(constantPaths.shared.chains)
              : layout === LayoutKey.VAULT
              ? constantPaths.vault.chains
              : constantPaths.default.leaderboard
          }
          className="logo"
        >
          {layout === LayoutKey.SHARED ? (
            <>
              {vault?.logo ? (
                <img className="shape" src={vault.logo} />
              ) : (
                <Vultisig className="shape" />
              )}

              <span className="name">{vault?.alias}</span>
            </>
          ) : (
            <>
              <Vultisig className="shape" />

              <span className="name">Vultisig</span>
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
            <Link
              to={
                layout === LayoutKey.SHARED
                  ? handleSharePath(constantPaths.shared.chains)
                  : layout === LayoutKey.VAULT
                  ? constantPaths.vault.chains
                  : constantPaths.default.leaderboard
              }
              className="logo"
            >
              {layout === LayoutKey.SHARED ? (
                <>
                  {vault?.logo ? (
                    <img className="shape" src={vault.logo} />
                  ) : (
                    <Vultisig className="shape" />
                  )}

                  <span className="name">{vault?.alias}</span>
                </>
              ) : (
                <>
                  <Vultisig className="shape" />

                  <span className="name">Vultisig</span>
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
