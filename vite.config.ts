import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      // 忽略TypeScript的类型检查错误
      allowlist: [/\.d\.ts$/],
    },
  },
  server: {
    proxy: {
      '/submit': 'http://localhost:8080'
    }
  }
})
