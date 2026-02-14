import { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useBaseContext } from "context";
import { getCurrentSeason } from "utils/functions";
import constantPaths from "routes/constant-paths";

/**
 * Guard for current season airdrop routes.
 * Redirects if the season ID doesn't match the current season.
 */
export const CurrentSeasonAirdropGuard = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const { id } = useParams<{ id: string }>();
  const { seasonInfo } = useBaseContext();
  const currentSeasonId = getCurrentSeason(seasonInfo)?.id;

  // Allow access only if id matches current season
  if (id && currentSeasonId && id === currentSeasonId) {
    return children;
  }

  // Redirect to root if trying to access current season airdrop when not in current season
  return <Navigate to={constantPaths.root} replace />;
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
