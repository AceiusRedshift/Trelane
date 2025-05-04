import m from "mithril";
import {Card} from "./card.js"
import {Deck} from "./deck.js"

const ROOT = document.getElementById("app");
const SPLASH_PATH = "/splash";
const EDITOR_PATH = "/edit";

let currentDeck = null;

/* Utility functions */
const button = (text, onclick, css) => m(
    "button",
    {
        className: css,
        onclick: onclick
    },
    text
);

let Splash = {
    makeDeck: () => {
        currentDeck = new Deck(prompt("What would you like to name the deck?"), prompt("What is your name? (Optional)"), [])
        m.route.set(EDITOR_PATH);
    },
    loadDeck: () => m.route.set(EDITOR_PATH),
    view: () => [
        m("div", {className: "mie header large center"}, [
            m(".heading", [
                m(".title", "Trelane"),
                m(".subtitle", "A semi-competent SRS"),
            ]),
        ]),
        m("div", {className: "mie view p-massive"},
            m("div", {className: "mie buttons"}, [
                button("New Deck", Splash.makeDeck),
                button("Load Deck", Splash.loadDeck, "accent")
            ])
        )
    ]
}

let Edit = {
    view: () => {
        if (currentDeck === null) {
            alert("Deck is unloaded, cannot edit unloaded deck.")
            m.route.set(SPLASH_PATH);
        }

        if (currentDeck.cards.length === 0) {
            return m("p", "No cards in deck.")
        }

        return m(".user-list", currentDeck.cards.map(function (card) {
            return m(".user-list-item", card.front + " " + card.back)
        }))
    }
}

try {
    let routes = {};
    routes[`${SPLASH_PATH}`] = Splash;
    routes[`${EDITOR_PATH}`] = Edit;

    m.route(ROOT, SPLASH_PATH, routes);
} catch (e) {
    m.render(ROOT, m("p", e.toString()));
    throw e;
}