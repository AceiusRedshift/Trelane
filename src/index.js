import m from "mithril";
import {Splash} from "./splash";
import {Edit} from "./edit";
import {Saver} from "./saver";
import {Review} from "./review";

const root = document.getElementById("app");

window.SPLASH_PATH = "/splash";
window.EDITOR_PATH = "/edit";
window.REVIEW_PATH = "/view";
window.LOADER_PATH = "/load";

try {
    let routes = {};
    routes[`${SPLASH_PATH}`] = Splash;
    routes[`${EDITOR_PATH}`] = Edit;
    routes[`${REVIEW_PATH}`] = Review;
    routes[`${LOADER_PATH}`] = Review; // TODO

    m.route(root, Saver.deckSaved ? EDITOR_PATH : SPLASH_PATH, routes);
} catch (e) {
    m.render(root, m("p", e.toString()));
    throw e;
}