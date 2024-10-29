declare global {
  interface Window {
    vultiConnect: { getVaults: () => Promise<VaultProps[]> };
    vultisig: { getVaults: () => Promise<VaultProps[]> };
  }
}
export {};
