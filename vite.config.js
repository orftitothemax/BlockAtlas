import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// prismarine-nbt was written for Node, so the browser build needs
// Node globals (Buffer, process) polyfilled. This is a known setup;
// see https://github.com/arpitjp/craft-from-schema-viewer for prior art.
export default defineConfig({
  plugins: [nodePolyfills()],
})
