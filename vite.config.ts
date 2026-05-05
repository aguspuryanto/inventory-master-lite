import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: true,
        hmr: {
          port: 5173
        }
      },
      plugins: [
        react(),
        // VitePWA({
        //   registerType: 'autoUpdate',
        //   workbox: {
        //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        //     runtimeCaching: [
        //       {
        //         urlPattern: /^https:\/\/api\.ezykasir\.com/i,
        //         handler: 'NetworkFirst',
        //         options: {
        //           cacheName: 'api-cache',
        //           expiration: {
        //             maxEntries: 100,
        //             maxAgeSeconds: 60 * 60 * 24 // 24 hours
        //           }
        //         }
        //       },
        //       {
        //         urlPattern: ({ request }) => request.destination === 'image',
        //         handler: 'CacheFirst',
        //         options: {
        //           cacheName: 'images-cache',
        //           expiration: {
        //             maxEntries: 60,
        //             maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        //           }
        //         }
        //       }
        //     ]
        //   },
        //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'pwa-64x64.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        //   manifest: {
        //     name: 'EzyKasir - POS System',
        //     short_name: 'EzyKasir',
        //     description: 'Aplikasi Point of Sale modern untuk bisnis Anda',
        //     theme_color: '#7c3aed',
        //     background_color: '#ffffff',
        //     display: 'standalone',
        //     orientation: 'portrait',
        //     scope: '/',
        //     start_url: '/',
        //     icons: [
        //       {
        //         src: 'pwa-64x64.png',
        //         sizes: '64x64',
        //         type: 'image/png'
        //       },
        //       {
        //         src: 'pwa-192x192.png',
        //         sizes: '192x192',
        //         type: 'image/png'
        //       },
        //       {
        //         src: 'pwa-512x512.png',
        //         sizes: '512x512',
        //         type: 'image/png',
        //         purpose: 'any maskable'
        //       }
        //     ]
        //   }
        // })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
