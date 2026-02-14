import { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useBaseContext } from "context";
import { getCurrentSeason } from "utils/functions";
import constantPaths from "routes/constant-paths";

/**
 * Guard for current season airdrop routes.
 * Blocks access if the season ID matches the current season.
 * Allows access to past seasons only.
 */
export const CurrentSeasonAirdropGuard = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const { id } = useParams<{ id: string }>();
  const { seasonInfo } = useBaseContext();
  const currentSeasonId = getCurrentSeason(seasonInfo)?.id;

  // Block access if id matches current season
  if (id && currentSeasonId && id === currentSeasonId) {
    return <Navigate to={constantPaths.root} replace />;
  }

  // Allow access to past seasons
  return children;
};

/**
 * Guard for achievements route.
 * Blocks all direct access to achievements pages and redirects to root.
 */
export const AchievementsGuard = ({
  children: _children,
}: {
  children: ReactNode;
}): ReactNode => {
  // Block all access to achievements pages
  return <Navigate to={constantPaths.root} replace />;
};

/**
 * Guard for swap route.
 * Blocks all direct access to swap pages and redirects to root.
 */
export const SwapGuard = ({
  children: _children,
}: {
  children: ReactNode;
}): ReactNode => {
  // Block all access to swap pages
  return <Navigate to={constantPaths.root} replace />;
};
