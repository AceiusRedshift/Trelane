import m from "mithril";
import { Splash } from "./splash";
import { Edit } from "./edit";
import { Storage } from "./storage";
import { Review } from "./review";
import { Help } from "./help";
import { Learn } from "./learn";
import { EDITOR_PATH, HELP_PATH, LEARN_PATH, REVIEW_PATH, SPLASH_PATH } from "./constants";
import {Toolbar} from "./toolbar";
import {validateAccount} from "./utils";

const root = document.getElementById("app");

const buildRoutes = () => {
    let routes = {};

    routes[SPLASH_PATH] = Splash;
    routes[EDITOR_PATH] = Edit;
    routes[REVIEW_PATH] = Review;
    routes[LEARN_PATH] = Learn;
    routes[HELP_PATH] = Help;
    
    return routes;
}

const initServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
            });
            if (registration.installing) {
                console.log("Service worker installing");
            } else if (registration.waiting) {
                console.log("Service worker installed");
            } else if (registration.active) {
                console.log("Service worker active");
            }
        } catch (error) {
            console.error(`Service worker regisration failed with ${error}`);
        }
    }
};

//try {
    Storage.init();
    
    if (Storage.hasAccount()) {
        validateAccount(Storage.getServerUrl(), Storage.getUsername(), Storage.getPassword());
    }
    
    document.body.setAttribute("data-theme", Storage.getActiveTheme().toString());

    m.mount(document.getElementById("toolbar"), Toolbar);
    m.route(root, Storage.hasActiveDeck() ? EDITOR_PATH : SPLASH_PATH, buildRoutes());

    initServiceWorker();
//} catch (e) {
//    m.render(root, m("p", e.toString()));
//    throw e;
//}