import { FC, useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Currency, LayoutKey } from "utils/constants";
import { changeTheme } from "utils/functions";
import { ChainProps, VaultProps } from "utils/interfaces";
import api from "utils/api";
import constantKeys from "i18n/constant-keys";
import constantPaths from "routes/constant-paths";
import PositionProvider from "utils/position-provider";
import VaultProvider from "utils/vault-provider";

import Header from "components/header";
import Preloader from "components/preloader";
import SplashScreen from "components/splash-screen";
import ChangeCurrency from "modals/change-currency";
import ChangeLanguage from "modals/change-language";

interface InitialState {
  loading: boolean;
  vault?: VaultProps;
}

const Component: FC = () => {
  const { t } = useTranslation();
  const initialState: InitialState = { loading: false };
  const [state, setState] = useState(initialState);
  const { loading, vault } = state;
  const { alias, chainKey, uid } = useParams<{
    alias?: string;
    chainKey?: string;
    uid: string;
  }>();
  const vaultProvider = new VaultProvider();
  const navigate = useNavigate();

  const prepareVault = (vault: VaultProps) => {
    const _assets = vault.chains.filter(({ coinsUpdated }) => !coinsUpdated);
    const _nfts = vault.chains.filter(({ nftsUpdated }) => !nftsUpdated);

    if (_assets.length) {
      if (!vault.assetsUpdating) {
        vault.assetsUpdating = true;

        _assets.forEach((item) =>
          vaultProvider.prepareChain(item, Currency.USD).then(updateChain)
        );
      }
    } else if (vault.assetsUpdating) {
      vault.assetsUpdating = false;
    }

    if (_nfts.length) {
      if (!vault.nftsUpdating) {
        vault.nftsUpdating = true;

        _nfts.forEach((item) =>
          vaultProvider.prepareNFT(item).then(updateChain)
        );
      }
    } else if (vault.nftsUpdating) {
      vault.nftsUpdating = false;
    }

    if (!vault.positionsUpdating) {
      if (!vault.positions.updated) {
        const positionProvider = new PositionProvider(vault);

        vault.positionsUpdating = true;

        positionProvider.getPrerequisites().then(() => {
          Promise.all([
            positionProvider.getLiquidityPositions().then(updatePositions),
            positionProvider.getMayaBond().then(updatePositions),
            positionProvider.getRuneProvider().then(updatePositions),
            positionProvider.getSaverPositions().then(updatePositions),
            positionProvider.getTCYStake().then(updatePositions),
            positionProvider.getThorBond().then(updatePositions),
          ]).then(() => {
            vault.positions = { updated: true };
          });
        });
      }
    } else if (vault.positions.updated) {
      vault.positionsUpdating = false;
    }

    updateVault(vault);
  };

  const updateChain = (chain: ChainProps): void => {
    setState((prevState) =>
      prevState.vault
        ? {
            ...prevState,
            vault: {
              ...prevState.vault,
              chains: prevState.vault.chains.map((item) =>
                item.name === chain.name ? { ...item, ...chain } : item
              ),
            },
          }
        : prevState
    );
  };

  const updatePositions = (positions: VaultProps["positions"]): void => {
    setState((prevState) =>
      prevState.vault
        ? {
            ...prevState,
            vault: {
              ...prevState.vault,
              positions: { ...prevState.vault.positions, ...positions },
            },
          }
        : prevState
    );
  };

  const updateVault = (vault: VaultProps): void => {
    setState((prevState) => ({ ...prevState, vault }));
  };

  const componentDidMount = (): void => {
    if (uid && /^[a-fA-F0-9]{64}$/.test(uid)) {
      api.vault
        .getById(uid)
        .then(({ data }) => {
          api.sharedSettings.get(uid).then(({ data: { logo, theme } }) => {
            changeTheme(theme);

            prepareVault({
              ...data,
              chains: data.chains.map((chain) => ({ ...chain, nfts: [] })),
              logo,
              positions: {},
              theme,
            });

            if (!alias) {
              navigate(
                (chainKey
                  ? constantPaths.shared.chainAssets.replace(
                      ":chainKey",
                      chainKey
                    )
                  : constantPaths.shared.chains
                )
                  .replace(":alias", data.alias.replace(/ /g, "-"))
                  .replace(":uid", data.uid),
                {
                  replace: true,
                }
              );
            }
          });
        })
        .catch(() => {
          navigate(constantPaths.root, { replace: true });
        });
    } else {
      navigate(constantPaths.root, { replace: true });
    }
  };

  useEffect(componentDidMount, []);

  return vault ? (
    <>
      <div className="layout layout-shared">
        <Header
          layout={LayoutKey.SHARED}
          vault={vault}
          updateVault={updateVault}
        />
        <Outlet
          context={{
            layout: LayoutKey.SHARED,
            vault,
            updateVault,
          }}
        />
        <div className="layout-footer">
          <span className="powered_by">{t(constantKeys.POWERED_BY)} </span>
          <Link to="https://vultisig.com/">Vultisig</Link>
        </div>
      </div>

      <ChangeCurrency />
      <ChangeLanguage />
      <Preloader visible={loading} />
    </>
  ) : (
    <SplashScreen />
  );
};

export default Component;
