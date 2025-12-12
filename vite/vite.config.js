import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import generateFile from 'vite-plugin-generate-file';

const generateResources = {
    'js': [],
    'css': [],
}

export default defineConfig(({ mode }) => {
    const baseUrl = mode === 'production' ? "/++plone++senaite.multiwellplate.static/bundles/" : "/";

    return {
        base: baseUrl,
        build: {
            outDir: "../src/senaite/multiwellplate/browser/static/bundles",
            emptyOutDir: true,
            copyPublicDir: false,
            rollupOptions: {
                input: {
                    app: './app/main.jsx',
                },
                output: {
                    entryFileNames: 'senaite.[name].[hash].js',
                    chunkFileNames: 'senaite.[name].[hash].js',
                    assetFileNames: 'senaite.[name].[hash].[ext]',
                },
            },
        },
        plugins: [
            react(),
            {
                name: 'save-generated-bundle',
                generateBundle(outputOptions, bundle) {
                    Object.keys(bundle).forEach((fileName) => {
                        const ext = fileName.split('.').pop();
                        generateResources[ext].push(baseUrl + fileName);
                    });
                },
            },
            generateFile([{
                type: 'template',
                output: '../../viewlets/templates/front-app-resources.pt',
                template: './front_app.ejs',
                data: {
                    files: generateResources
                }
            }]),
        ],
    }
})

