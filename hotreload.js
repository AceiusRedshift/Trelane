document.addEventListener('DOMContentLoaded', () => {
    let hotReloadSetup = false;
    while (!hotReloadSetup) {
        try {
            new EventSource("/esbuild").addEventListener("change", () => location.reload());
            hotReloadSetup = true;
            console.info("Hot reload initialized.");
        } catch (e) {
            hotReloadSetup = false;
        }
    }
});