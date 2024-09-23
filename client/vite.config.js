import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  rollupOptions: {
    include: ['html2canvas'], // Externalize html2canvas
  },
  server: {
    port: 5173,
  }
});
