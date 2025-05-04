import m from "mithril";
import {Splash} from "./splash";
import {Edit} from "./edit";
import {Saver} from "./saver";
import {Review} from "./review";

const root = document.getElementById("app");

window.SPLASH_PATH = "/splash";
window.EDITOR_PATH = "/edit";
window.REVIEW_PATH = "/view";
window.CurrentDeck = null;

try {
    if (Saver.deckSaved()) {
        console.log("Restoring Saved Deck")
        CurrentDeck = Saver.getDeck();
    }

    let routes = {};
    routes[`${SPLASH_PATH}`] = Splash;
    routes[`${EDITOR_PATH}`] = Edit;
    routes[`${REVIEW_PATH}`] = Review;

    m.route(root, Saver.deckSaved ? EDITOR_PATH : SPLASH_PATH, routes);

    setInterval(() => {
        if (CurrentDeck != null) {
            Saver.setDeck(CurrentDeck);
        }
    }, 1000);
} catch (e) {
    m.render(root, m("p", e.toString()));
    throw e;
}