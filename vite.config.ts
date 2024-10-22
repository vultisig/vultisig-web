import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      "~variables": path.resolve(__dirname, "src/styles/_variables"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~variables" as *;`,
      },
    },
  },
});
