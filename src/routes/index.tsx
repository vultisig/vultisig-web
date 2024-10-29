import {
  RouteObject,
  RouterProvider,
  Navigate,
  createBrowserRouter,
} from "react-router-dom";
import React from "react";

import { getStoredVaults } from "utils/storage";
import constantPaths from "routes/constant-paths";

import ShareLayout from "layouts/shared";
import VaultLayout from "layouts/vault";

import AssetsPage from "pages/assets";
import ChainsPage from "pages/chains";
import ImportPage from "pages/import";
import LeaderboardPage from "pages/leaderboard";
import PositionsPage from "pages/positions";
import RedirectPage from "pages/redirect";
import UploadPage from "pages/upload";

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
      path: constantPaths.redirect,
      element: <RedirectPage />,
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
          path: constantPaths.shared.positions,
          element: <PositionsPage />,
        },
        {
          path: constantPaths.shared.chains,
          element: <ChainsPage />,
        },
        {
          path: constantPaths.shared.chainsAlias,
          element: <ChainsPage />,
        },
        {
          path: constantPaths.shared.assets,
          element: <AssetsPage />,
        },
        {
          path: constantPaths.shared.assetsAlias,
          element: <AssetsPage />,
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
          element: <AssetsPage />,
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
