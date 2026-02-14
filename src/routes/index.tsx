import { ReactNode, Suspense, lazy } from "react";
import {
  RouteObject,
  RouterProvider,
  Navigate,
  createBrowserRouter,
} from "react-router-dom";

import { getStoredVaults } from "utils/storage";
import constantPaths from "routes/constant-paths";
import { getCurrentSeason, handleSeasonPath } from "utils/functions";
import { useBaseContext } from "context";
import {
  CurrentSeasonAirdropGuard,
  PositionsGuard,
  AchievementsGuard,
  SwapGuard,
} from "utils/route-guards";

const DefaultLayout = lazy(() => import("layouts/default"));
const ShareLayout = lazy(() => import("layouts/shared"));
const VaultLayout = lazy(() => import("layouts/vault"));

const ChainAssetsPage = lazy(() => import("pages/chain-assets"));
const ChainsPage = lazy(() => import("pages/chains"));
const ImportPage = lazy(() => import("pages/import"));
const AirdropPage = lazy(() => import("pages/airdrop"));
const AchievmentsPage = lazy(() => import("pages/achievements"));
const NFTAssetsPage = lazy(() => import("pages/nft-assets"));
const NFTsPage = lazy(() => import("pages/nfts"));
const OnboardingPage = lazy(() => import("pages/onboarding"));
const PositionsPage = lazy(() => import("pages/positions"));
const RedirectPage = lazy(() => import("pages/redirect"));
const SwapPage = lazy(() => import("pages/swap"));
const UploadPage = lazy(() => import("pages/upload"));

interface RouteConfig {
  path: string;
  element?: ReactNode;
  children?: RouteConfig[];
  redirect?: string;
}

const Component = () => {
  const vaults = getStoredVaults();
  const { seasonInfo } = useBaseContext();
  const airdropPath = handleSeasonPath(
    constantPaths.default.airdrop,
    getCurrentSeason(seasonInfo)?.id || "0"
  );

  const processRoutes = (routes: RouteConfig[]): RouteObject[] => {
    return routes.reduce<RouteObject[]>(
      (acc, { children, element, path, redirect }) => {
        if (redirect) {
          const processedRoute: RouteObject = {
            path,
            element: <Navigate to={redirect} replace />,
          };
          acc.push(processedRoute);
        } else if (element) {
          const processedRoute: RouteObject = {
            path,
            element,
            children: children ? processRoutes(children) : undefined,
          };
          acc.push(processedRoute);
        }

        return acc;
      },
      []
    );
  };

  const routes: RouteConfig[] = [
    {
      path: constantPaths.root,
      redirect: vaults.length ? constantPaths.vault.chains : airdropPath,
    },
    {
      path: constantPaths.redirect,
      element: <RedirectPage />,
    },
    {
      path: constantPaths.default.root,
      element: (
        <Suspense>
          <DefaultLayout />
        </Suspense>
      ),
      children: [
        {
          path: constantPaths.default.root,
          redirect: airdropPath,
        },
        {
          path: constantPaths.default.import,
          element: (
            <Suspense>
              <ImportPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.default.airdrop,
          element: (
            <Suspense>
              <CurrentSeasonAirdropGuard>
                <AirdropPage />
              </CurrentSeasonAirdropGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.default.swap,
          element: (
            <Suspense>
              <SwapGuard>
                <SwapPage />
              </SwapGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.default.onboarding,
          element: (
            <Suspense>
              <OnboardingPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.default.upload,
          element: (
            <Suspense>
              <UploadPage />
            </Suspense>
          ),
        },
        {
          path: "*",
          redirect: constantPaths.root,
        },
      ],
    },
    {
      path: constantPaths.shared.root,
      element: (
        <Suspense>
          <ShareLayout />
        </Suspense>
      ),
      children: [
        {
          path: constantPaths.shared.root,
          redirect: constantPaths.root,
        },
        {
          path: constantPaths.shared.airdrop,
          element: (
            <Suspense>
              <CurrentSeasonAirdropGuard>
                <AirdropPage />
              </CurrentSeasonAirdropGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.swap,
          element: (
            <Suspense>
              <SwapGuard>
                <SwapPage />
              </SwapGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.positions,
          element: (
            <Suspense>
              <PositionsGuard>
                <PositionsPage />
              </PositionsGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.nfts,
          element: (
            <Suspense>
              <NFTsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.nftAssets,
          element: (
            <Suspense>
              <NFTAssetsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.chainAssets,
          element: (
            <Suspense>
              <ChainAssetsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.chainAssetsRedirect,
          element: (
            <Suspense>
              <ChainAssetsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.chains,
          element: (
            <Suspense>
              <ChainsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.chainsRedirect,
          element: (
            <Suspense>
              <ChainsPage />
            </Suspense>
          ),
        },
        {
          path: "*",
          redirect: constantPaths.root,
        },
      ],
    },
    {
      path: constantPaths.vault.root,
      element: (
        <Suspense>
          <VaultLayout />
        </Suspense>
      ),
      children: [
        {
          path: constantPaths.vault.root,
          redirect: constantPaths.vault.chains,
        },
        {
          path: constantPaths.vault.achievements,
          element: (
            <Suspense>
              <AchievementsGuard>
                <AchievmentsPage />
              </AchievementsGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.airdrop,
          element: (
            <Suspense>
              <CurrentSeasonAirdropGuard>
                <AirdropPage />
              </CurrentSeasonAirdropGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.swap,
          element: (
            <Suspense>
              <SwapGuard>
                <SwapPage />
              </SwapGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.positions,
          element: (
            <Suspense>
              <PositionsGuard>
                <PositionsPage />
              </PositionsGuard>
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.nfts,
          element: (
            <Suspense>
              <NFTsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.nftAssets,
          element: (
            <Suspense>
              <NFTAssetsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.chains,
          element: (
            <Suspense>
              <ChainsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.chainAssets,
          element: (
            <Suspense>
              <ChainAssetsPage />
            </Suspense>
          ),
        },
        {
          path: "*",
          redirect: constantPaths.root,
        },
      ],
    },
    {
      path: "*",
      redirect: constantPaths.root,
    },
  ];

  const router = createBrowserRouter(processRoutes(routes), {
    basename: constantPaths.basePath,
  });

  return <RouterProvider router={router} />;
};

export type { RouteConfig };

export default Component;
