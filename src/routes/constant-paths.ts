export default {
  root: "/",
  basePath: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  import: "/import",
  upload: "/upload",
  shared: {
    root: "/shared",
    chains: "/shared/:uid",
    chainsAlias: "/shared/vault/:alias/:uid",
    assets: "/shared/:uid/:chainKey",
    assetsAlias: "/shared/vault/:alias/:uid/:chainKey",
  },
  vault: {
    root: "/",
    assets: "/balances/:chainKey",
    chains: "/balances",
    leaderboard: "/leaderboard",
    positions: "/positions",
  },
};
