import {
  RouteObject,
  RouterProvider,
  Navigate,
  createBrowserRouter,
} from "react-router-dom";
import React from "react";

import { getStoredVaults } from "utils/storage";
import constantPaths from "routes/constant-paths";

import ShareLayout from "layout/shared";
import VaultLayout from "layout/vault";

import AssetPage from "pages/assets";
import ChainsPage from "pages/chains";
import ImportPage from "pages/import";
import LeaderboardPage from "pages/leaderboard";
import PositionsPage from "pages/positions";
import UploadPage from "pages/upload";

import SharedAssetsPage from "pages/shared/assets";
import SharedChainsPage from "pages/shared/chains";

interface RouteConfig {
  path: string;
  element?: React.ReactNode;
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
        : constantPaths.import,
    },
    {
      path: constantPaths.import,
      element: <ImportPage />,
    },
    {
      path: constantPaths.upload,
      element: <UploadPage />,
    },
    {
      path: constantPaths.shared.root,
      element: <ShareLayout />,
      children: [
        {
          path: constantPaths.shared.root,
          redirect: constantPaths.root,
        },
        {
          path: constantPaths.shared.chains,
          element: <SharedChainsPage />,
        },
        {
          path: constantPaths.shared.chainsAlias,
          element: <SharedChainsPage />,
        },
        {
          path: constantPaths.shared.assets,
          element: <SharedAssetsPage />,
        },
        {
          path: constantPaths.shared.assetsAlias,
          element: <SharedAssetsPage />,
        },
        {
          path: "*",
          redirect: constantPaths.root,
        },
      ],
    },
    {
      path: constantPaths.vault.root,
      element: <VaultLayout />,
      children: [
        {
          path: constantPaths.vault.root,
          redirect: constantPaths.vault.chains,
        },
        {
          path: constantPaths.vault.chains,
          element: <ChainsPage />,
        },
        {
          path: constantPaths.vault.assets,
          element: <AssetPage />,
        },
        {
          path: constantPaths.vault.leaderboard,
          element: <LeaderboardPage />,
        },
        {
          path: constantPaths.vault.positions,
          element: <PositionsPage />,
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
