import { defineConfig } from "vite"
import { loom } from "./src/loom"

export default defineConfig({
  plugins: [loom()],
})
