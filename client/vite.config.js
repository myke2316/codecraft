import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["html2canvas", "jspdf"],
  }, build: {
    rollupOptions: {
      external: ["html2canvas", "jspdf"],  // Externalizes these libraries if needed
    },
  },
  server: {
    port: 5173,
  },
});
