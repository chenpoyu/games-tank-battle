import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署時需要設定 base path
  // 對應 https://<username>.github.io/games-tank-battle/
  base: process.env.GITHUB_ACTIONS ? '/games-tank-battle/' : '/',
  server: {
    port: 3000,
    open: true,
  },
});
