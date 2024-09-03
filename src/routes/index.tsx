import {
  RouteObject,
  RouterProvider,
  Navigate,
  createBrowserRouter,
} from "react-router-dom";
import React from "react";

import constantPaths from "routes/constant-paths";

import ShareLayout from "layout/shared";
import VaultLayout from "layout/vault";

import AssetPage from "pages/assets";
import ChainsPage from "pages/chains";
import ImportPage from "pages/import";

import SharedAssetsPage from "pages/shared/assets";
import SharedChainsPage from "pages/shared/chains";

interface RouteConfig {
  path: string;
  element?: React.ReactNode;
  children?: RouteConfig[];
  redirect?: string;
}

const Component = () => {
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
      redirect: constantPaths.chains,
    },
    {
      path: constantPaths.import,
      element: <ImportPage />,
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
          path: constantPaths.shared.assets,
          element: <SharedAssetsPage />,
        },
        {
          path: "*",
          redirect: constantPaths.root,
        },
      ],
    },
    {
      path: constantPaths.root,
      element: <VaultLayout />,
      children: [
        {
          path: constantPaths.root,
          redirect: constantPaths.chains,
        },
        {
          path: constantPaths.chains,
          element: <ChainsPage />,
        },
        {
          path: constantPaths.assets,
          element: <AssetPage />,
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
