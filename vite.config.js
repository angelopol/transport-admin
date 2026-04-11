import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            outDir: 'public/build',
            buildBase: '/build/',
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: {
                name: 'SIMCI-TU Panel Operativo',
                short_name: 'SIMCI-TU',
                description: 'Sistema Integral para el Monitoreo Remoto Computarizado Inteligente',
                theme_color: '#1e3a8a',
                background_color: '#f8fafc',
                display: 'standalone',
                icons: [
                    {
                        src: '/logo-192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml'
                    },
                    {
                        src: '/logo-512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    server: {
        host: '0.0.0.0',
        hmr: {
            host: '172.16.0.28',
        }
    }
});
