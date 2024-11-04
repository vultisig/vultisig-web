import { ReactNode, Suspense, lazy } from "react";
import {
  RouteObject,
  RouterProvider,
  Navigate,
  createBrowserRouter,
} from "react-router-dom";

import { getStoredVaults } from "utils/storage";
import constantPaths from "routes/constant-paths";

const DefaultLayout = lazy(() => import("layouts/default"));
const ShareLayout = lazy(() => import("layouts/shared"));
const VaultLayout = lazy(() => import("layouts/vault"));

const AssetsPage = lazy(() => import("pages/assets"));
const ChainsPage = lazy(() => import("pages/chains"));
const ImportPage = lazy(() => import("pages/import"));
const LeaderboardPage = lazy(() => import("pages/leaderboard"));
const PositionsPage = lazy(() => import("pages/positions"));
const RedirectPage = lazy(() => import("pages/redirect"));
const UploadPage = lazy(() => import("pages/upload"));

interface RouteConfig {
  path: string;
  element?: ReactNode;
  children?: RouteConfig[];
  redirect?: string;
}

const Component = () => {
  const vaults = getStoredVaults();

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
      redirect: vaults.length
        ? constantPaths.vault.chains
        : constantPaths.default.import,
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
          redirect: constantPaths.default.import,
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
          path: constantPaths.default.leaderboard,
          element: (
            <Suspense>
              <LeaderboardPage />
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
          path: constantPaths.shared.leaderboard,
          element: (
            <Suspense>
              <LeaderboardPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.positions,
          element: (
            <Suspense>
              <PositionsPage />
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
          path: constantPaths.shared.chainsAlias,
          element: (
            <Suspense>
              <ChainsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.assets,
          element: (
            <Suspense>
              <AssetsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.shared.assetsAlias,
          element: (
            <Suspense>
              <AssetsPage />
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
          path: constantPaths.vault.chains,
          element: (
            <Suspense>
              <ChainsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.assets,
          element: (
            <Suspense>
              <AssetsPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.leaderboard,
          element: (
            <Suspense>
              <LeaderboardPage />
            </Suspense>
          ),
        },
        {
          path: constantPaths.vault.positions,
          element: (
            <Suspense>
              <PositionsPage />
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
