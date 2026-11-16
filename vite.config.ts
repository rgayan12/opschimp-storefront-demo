import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.OPSCHIMP_BASE_URL || 'http://localhost:8080/api/v1/client';
  const apiKey = env.OPSCHIMP_API_KEY || '';

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Priority: Header from demo override, else env variable
              const overrideKey = req.headers['x-demo-api-key'];
              const token = (typeof overrideKey === 'string' && overrideKey.trim()) ? overrideKey.trim() : apiKey;
              if (token) {
                proxyReq.setHeader('Authorization', `Bearer ${token}`);
              }
            });
          }
        }
      }
    }
  };
});
