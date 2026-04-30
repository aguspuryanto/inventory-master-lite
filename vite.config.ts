import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import cors from 'cors';
import { VitePWA } from 'vite-plugin-pwa';
// import mix from 'vite-plugin-mix'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: false,
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/api\./i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 // 24 hours
                  }
                }
              }
            ]
          },
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
          manifest: {
            name: 'EzyKasir - POS System',
            short_name: 'EzyKasir',
            description: 'Aplikasi Point of Sale modern untuk bisnis Anda',
            theme_color: '#7c3aed',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: 'pwa-64x64.png',
                sizes: '64x64',
                type: 'image/png'
              },
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        }),
        {
          name: 'express-api',
          configureServer(server) {
            const app = express();
            app.use(cors());
            app.use(express.json());
            
            // Simple inline API routes for now
            app.get('/api/health', (req, res) => {
              res.json({ 
                status: 'OK', 
                message: 'EzyKasir API is running',
                timestamp: new Date().toISOString()
              });
            });
            
            app.get('/api/products', async (req, res) => {
              try {
                const { db } = await import('./services/db');
                const storeId = req.query.storeId || null;
                const products = await db.getProducts(storeId as string | null);
                res.json({
                  success: true,
                  data: products,
                  count: products.length
                });
              } catch (error) {
                res.status(500).json({
                  success: false,
                  error: 'Failed to fetch products'
                });
              }
            });
            
            app.get('/api/transactions', async (req, res) => {
              try {
                const { db } = await import('./services/db');
                const storeId = req.query.storeId || null;
                const transactions = await db.getTransactions(storeId as string | null);
                res.json({
                  success: true,
                  data: transactions,
                  count: transactions.length
                });
              } catch (error) {
                res.status(500).json({
                  success: false,
                  error: 'Failed to fetch transactions'
                });
              }
            });
            
            // Use the Express app before Vite's middleware
            server.middlewares.use('/api', app);
          }
        }
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
