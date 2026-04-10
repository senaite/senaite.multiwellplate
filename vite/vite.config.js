import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import generateFile from 'vite-plugin-generate-file';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

const generateResources = {
    'js': [],
    'css': [],
}

export default defineConfig(({ mode }) => {
    const baseUrl = mode === 'production' ? "/++plone++senaite.multiwellplate.static/bundles/" : "/";

    return {
        base: baseUrl,
//        optimizeDeps: {
//            include: ['json-rules-engine'],
//        },
        build: {
            outDir: "../src/senaite/multiwellplate/browser/static/bundles",
            emptyOutDir: true,
            copyPublicDir: false,
//            commonjsOptions: {
//                include: [/json-rules-engine/, /node_modules/],
//            },
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
            viteCommonjs(),
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

