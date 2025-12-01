import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Disable cross-origin isolation so Firebase auth popups can close cleanly
    crossOriginIsolated: false,
    headers: {
      // Suppress COOP warnings in development
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'credentialless'
    }
  }
})
