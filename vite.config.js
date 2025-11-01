import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/js/public-wizard-app.jsx',
                'resources/js/admin-app.jsx'
            ],
            refresh: true,
        }),
        react({
            devTarget: 'esnext',
        }),
        tailwindcss(),
    ],
    esbuild: {
        loader: 'jsx',
        include: /resources\/js\/.*\.jsx?$/,
    },
});
