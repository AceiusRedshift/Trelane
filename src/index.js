import m from "mithril";
import { Splash } from "./splash";
import { Edit } from "./edit";
import { Saver } from "./saver";
import { Review } from "./review";
import { Load } from "./load";
import { Help } from "./help";
import { Learn } from "./learn";

const root = document.getElementById("app");

window.SPLASH_PATH = "/splash";
window.EDITOR_PATH = "/edit";
window.REVIEW_PATH = "/view";
window.LOADER_PATH = "/load";
window.LEARN_PATH = "/learn";
window.HELP_PATH = "/help";

try {
    let routes = {};
    routes[`${SPLASH_PATH}`] = Splash;
    routes[`${EDITOR_PATH}`] = Edit;
    routes[`${REVIEW_PATH}`] = Review;
    routes[`${LOADER_PATH}`] = Load;
    routes[`${LEARN_PATH}`] = Learn;
    routes[`${HELP_PATH}`] = Help;

    m.route(root, Saver.isDeckSaved ? EDITOR_PATH : SPLASH_PATH, routes);
} catch (e) {
    m.render(root, m("p", e.toString()));
    throw e;
}