import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@tanstack/react-query", "notistack"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://lms-app-2ol6.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
