import esbuildPluginTsc from 'esbuild-plugin-tsc';

export function createBuildSettings(options) {
    return {
        entryPoints: [
            'src/index.html',
            'src/index.css',
            'src/index.js',
            'src/manifest.json',
        ],
        loader: {
            ".html": "copy"
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