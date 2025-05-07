import m from "mithril";
import { Splash } from "./splash";
import { Edit } from "./edit";
import { Storage } from "./storage";
import { Review } from "./review";
import { Help } from "./help";
import { Learn } from "./learn";
import {EDITOR_PATH, HELP_PATH, LEARN_PATH, REVIEW_PATH, SPLASH_PATH} from "./constants";

const root = document.getElementById("app");

try {
    let routes = {};
    routes[`${SPLASH_PATH}`] = Splash;
    routes[`${EDITOR_PATH}`] = Edit;
    routes[`${REVIEW_PATH}`] = Review;
    routes[`${LEARN_PATH}`] = Learn;
    routes[`${HELP_PATH}`] = Help;

    Storage.init();

    m.route(root, Storage.hasActiveDeck() ? EDITOR_PATH : SPLASH_PATH, routes);
} catch (e) {
    m.render(root, m("p", e.toString()));
    throw e;
}