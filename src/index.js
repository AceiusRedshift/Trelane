import m from "mithril";
import {Splash} from "./splash";
import {Edit} from "./edit";

const ROOT = document.getElementById("app");
window.SPLASH_PATH = "/splash";
window.EDITOR_PATH = "/edit";
window.CurrentDeck = null;

setInterval(() => {
    if (CurrentDeck != null) {
        // TODO autosave
    }
}, 1000);

try {
    let routes = {};
    routes[`${SPLASH_PATH}`] = Splash;
    routes[`${EDITOR_PATH}`] = Edit;

    m.route(ROOT, SPLASH_PATH, routes);
} catch (e) {
    m.render(ROOT, m("p", e.toString()));
    throw e;
}