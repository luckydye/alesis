import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import Terminal from 'vite-plugin-terminal';

export default defineConfig({
  base: '/alesis/',
  plugins: [preact(), tailwindcss(), Terminal({
    console: 'terminal',
    output: ['terminal', 'console']
  })],
  server: {
    port: 3000,
  },
});
