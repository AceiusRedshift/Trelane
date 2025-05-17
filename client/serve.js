import esbuild from 'esbuild';
import {createBuildSettings} from './settings.js';

const buildContext = await esbuild.context(
    createBuildSettings({
        sourcemap: true, banner: {
            js: `new EventSource('/esbuild').addEventListener('change', () => location.reload());`,
        }
    })
);

await buildContext.watch();

buildContext.serve({
    port: 8000, 
    servedir: 'bin', 
    fallback: "bin/index.html"
}).then((result) => {
    console.log(`Serving app at ${result.hosts[0]}:${result.port}.`);
})