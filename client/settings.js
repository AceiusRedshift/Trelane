import esbuildPluginTsc from 'esbuild-plugin-tsc';

export function createBuildSettings(options) {
    return {
        entryPoints: [
            'src/index.html',
            'src/index.css',
            'src/index.js',
            
            'src/manifest.json',
            'src/favicon.png',
            'src/favicon-512.png',
        ],
        loader: {
            ".html": "copy",
            ".json": "copy",
            ".png": "copy",
        },
        outdir: 'bin',
        bundle: true,
        plugins: [
            esbuildPluginTsc({
                force: true
            }),
        ],
        ...options
    };
}