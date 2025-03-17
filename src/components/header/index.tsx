import { FC, useEffect, useState } from "react";
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
import { ClockCircleOutlined } from "@ant-design/icons";

import { useBaseContext } from "context";
import { Language, languageName, LayoutKey, PageKey } from "utils/constants";
import {
  getAssetsBalance,
  getNFTsBalance,
  getPositionsBalance,
} from "utils/functions";
import { VaultProps } from "utils/interfaces";
import { getStoredVaults } from "utils/storage";
import api from "utils/api";
import useGoBack from "hooks/go-back";
import i18n from "i18n/config";
import constantKeys from "i18n/constant-keys";
import constantModals from "modals/constant-modals";
import constantPaths from "routes/constant-paths";

import {
  ArrowRight,
  CircleDollar,
  CircleHelp,
  CircleUser,
  ChromeExtension,
  ExternalLink,
  Globe,
  HamburgerLG,
  RadioWave,
  Settings,
  Storage,
  Vultisig,
} from "icons";

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
  const { activePage, baseValue, currency } = useBaseContext();
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
      .replace(":alias", (vault?.alias || "").replace(/ /g, "-"))
      .replace(":uid", vault?.uid || "");
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
  let selectedKey: string;

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

  switch (activePage) {
    case PageKey.SHARED_CHAINS:
    case PageKey.SHARED_CHAIN_ASSETS:
    case PageKey.VAULT_CHAINS:
    case PageKey.VAULT_CHAIN_ASSETS:
      selectedKey = "1-1";
      break;
    case PageKey.SHARED_NFTS:
    case PageKey.SHARED_NFT_ASSETS:
    case PageKey.VAULT_NFTS:
    case PageKey.VAULT_NFT_ASSETS:
      selectedKey = "1-2";
      break;
    case PageKey.SHARED_POSITIONS:
    case PageKey.VAULT_POSITIONS:
      selectedKey = "1-3";
      break;
    case PageKey.AIRDROP:
    case PageKey.SHARED_AIRDROP:
    case PageKey.VAULT_AIRDROP:
      selectedKey = "2-1";
      break;
    case PageKey.SWAP:
    case PageKey.SHARED_SWAP:
    case PageKey.VAULT_SWAP:
      selectedKey = "2-2";
      break;
    case PageKey.ACHIEVEMENTES:
      selectedKey = "3";
      break;
    case PageKey.ONBOARDING:
      selectedKey = "4";
      break;
    case PageKey.IMPORT:
    case PageKey.UPLOAD:
      selectedKey = "5";
      break;
    default:
      selectedKey = "";
      break;
  }

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });
  const isTablet = useMediaQuery({ query: "(min-width: 768px)" });

  const dropdownMenu: MenuProps["items"] = [
    {
      key: "0",
      type: "group",
      label: t(constantKeys.VAULT_BALANCE),
      children: [
        ...(layout === LayoutKey.VAULT
          ? [
              {
                key: "0-1",
                label: (
                  <span className="balance">
                    {vault
                      ? (
                          (getAssetsBalance(vault) +
                            getNFTsBalance(vault) +
                            getPositionsBalance(vault)) *
                          baseValue
                        ).toValueFormat(currency)
                      : 0}
                  </span>
                ),
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

  const _firstItems: MenuProps["items"] = [
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
  ];

  const _lastItems: MenuProps["items"] = [
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
  ];

  const navbarMenu: MenuProps["items"] = [
    ...(vaults.length ? _firstItems : []),
    {
      key: "2",
      label: t(constantKeys.LEADERBOARD),
      icon: <ArrowRight />,
      type: "submenu",
      children: [
        {
          key: "2-1",
          label: (
            <Link
              to={
                layout === LayoutKey.SHARED
                  ? handleSharePath(constantPaths.shared.aridrop)
                  : vaults.length
                  ? constantPaths.vault.aridrop
                  : constantPaths.default.aridrop
              }
            >
              {t(constantKeys.AIRDROP)}
            </Link>
          ),
        },
        {
          key: "2-2",
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
      ],
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

    ...(!vaults.length ? _lastItems : []),
  ];

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
        {/* <Button href={`#${constantModals.SHARE_ACHIEVEMENTS}`}>"Share"</Button> */}
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
              : constantPaths.default.aridrop
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
          <Menu
            items={navbarMenu}
            selectedKeys={selectedKey ? [selectedKey] : []}
            mode="horizontal"
            rootClassName="layout-header-menu"
          />
        )}

        {isTablet && vault && (
          <div className="balance">
            <ClockCircleOutlined className="clock-icon" />
            <span className="text">{`${t(
              constantKeys.SEASON_END_TIME
            )}:`}</span>
            <span className="value">30d 6h 24min</span>
          </div>
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
                  : constantPaths.default.aridrop
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
          <div className="balance">
            <ClockCircleOutlined className="clock-icon" />
            <span className="text">{`${t(
              constantKeys.SEASON_END_TIME
            )}:`}</span>
            <span className="value">30d 6h 24min</span>
          </div>
          {vault && (
            <>
              <div className="balance">
                <Storage className="icon" />
                <span className="text">{`${t(
                  constantKeys.VAULT_BALANCE
                )}:`}</span>
                <span className="value">
                  {(
                    (getAssetsBalance(vault) +
                      getNFTsBalance(vault) +
                      getPositionsBalance(vault)) *
                    baseValue
                  ).toValueFormat(currency)}
                </span>
              </div>
              <Divider />
            </>
          )}
          <Menu
            items={navbarMenu.map((item) =>
              item?.type ? { ...item, type: "group" } : item
            )}
            selectedKeys={[]}
          />
          <Divider />
          <Menu items={dropdownMenu} selectedKeys={[]} />
        </Drawer>
      )}

      {contextHolder}
    </>
  );
};

export default Component;
