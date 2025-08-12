import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is set by the GitHub Actions workflow to "/<repo-name>/"
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
})
