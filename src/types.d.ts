declare global {
  interface Window {
    vultiConnect: { getVaults: () => Promise<VaultProps[]> };
  }
}
export {};
