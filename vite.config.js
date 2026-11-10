import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { liveNewsApi } from './server/apiPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), liveNewsApi()],
})
