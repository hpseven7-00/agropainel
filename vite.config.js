import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Mantém a raiz no desenvolvimento e usa a subpasta no GitHub Pages.
  base: command === 'build' ? '/agropainel/' : '/',
  plugins: [react()],
}))
