import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    // Local dev proxy — only used when running `npm run dev`
    proxy: {
      "/api": "http://localhost:5000"
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  }
})