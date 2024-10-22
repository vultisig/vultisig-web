export default {
  root: "/",
  basePath: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  import: "/import",
  upload: "/upload",
  redirect: "/redirect/:ecdsa/:eddsa",
  shared: {
    root: "/shared",
    chains: "/shared/:uid",
    chainsAlias: "/shared/vault/:alias/:uid",
    assets: "/shared/:uid/:chainKey",
    assetsAlias: "/shared/vault/:alias/:uid/:chainKey",
    positions: "/shared/vault/:alias/:uid/positions",
  },
  vault: {
    root: "/",
    assets: "/balances/:chainKey",
    chains: "/balances",
    leaderboard: "/leaderboard",
    positions: "/positions",
  },
};
