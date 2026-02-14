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
 * Guard for positions route.
 * Currently allows access - add conditions here if needed.
 */
export const PositionsGuard = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  // Add any conditions here if needed
  return children;
};

/**
 * Guard for achievements route.
 * Currently allows access - add conditions here if needed.
 */
export const AchievementsGuard = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  // Add any conditions here if needed
  return children;
};

/**
 * Guard for swap route.
 * Currently allows access - add conditions here if needed.
 */
export const SwapGuard = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  // Add any conditions here if needed
  return children;
};
