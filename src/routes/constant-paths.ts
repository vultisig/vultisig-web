export default {
  root: "/",
  basePath: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  assets: "/chains/:chainKey",
  chains: "/chains",
  import: "/import",
  upload: "/upload",
  shared: {
    root: "/shared",
    chains: "/shared/:uid",
    chainsAlias: "/shared/vault/:alias/:uid",
    assets: "/shared/:uid/:chainKey",
    assetsAlias: "/shared/vault/:alias/:uid/:chainKey",
  },
};
