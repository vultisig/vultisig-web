export default {
  root: "/",
  basePath: import.meta.env.DEV ? "/" : import.meta.env.VITE_BASE_PATH,
  assets: "/chains/:chainKey",
  chains: "/chains",
  import: "/import",
  shared: {
    root: "/shared",
    chains: "/shared/:uid",
    assets: "/shared/:uid/:chainKey",
  },
};
