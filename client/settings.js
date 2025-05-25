export function createBuildSettings(options) {
    return {
        entryPoints: [
            'src/index.html',
            'src/index.css',
            'src/index.js',
            
            'src/favicon.png',
            'src/favicon-512.png',
        ],
        loader: {
            ".html": "copy",
            ".png": "copy"
        },
        outdir: 'bin',
        bundle: true,
        format: 'esm',
        treeShaking: true,
        ...options
    };
}