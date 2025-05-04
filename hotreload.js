function setupHotReload() {
    try {
        new EventSource("/esbuild").addEventListener("change", () => location.reload());
        console.info("Hot reload initialized.");
    } catch (e) {
        setupHotReload();
    }
}

document.addEventListener('DOMContentLoaded', setupHotReload);