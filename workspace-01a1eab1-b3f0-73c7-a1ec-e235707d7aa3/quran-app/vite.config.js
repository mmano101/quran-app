import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server is bound to 0.0.0.0 so it can be reached through the preview proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
