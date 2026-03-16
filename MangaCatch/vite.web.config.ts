// Chromebook / ブラウザ専用の Vite 設定（Electron プラグインなし）
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
