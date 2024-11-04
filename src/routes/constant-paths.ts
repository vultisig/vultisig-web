export default {
  root: "/",
  basePath: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  redirect: "/redirect/:ecdsa/:eddsa",
  default: {
    root: "/",
    import: "/import",
    leaderboard: "/leaderboard",
    upload: "/upload",
  },
  shared: {
    root: "/shared",
    chains: "/shared/:uid",
    chainsAlias: "/shared/vault/:alias/:uid",
    assets: "/shared/:uid/:chainKey",
    assetsAlias: "/shared/vault/:alias/:uid/:chainKey",
    leaderboard: "/shared/vault/:alias/:uid/leaderboard",
    positions: "/shared/vault/:alias/:uid/positions",
  },
  vault: {
    root: "/vault",
    assets: "/vault/balances/:chainKey",
    chains: "/vault/balances",
    leaderboard: "/vault/leaderboard",
    positions: "/vault/positions",
  },
};
