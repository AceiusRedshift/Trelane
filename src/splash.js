import {Deck} from "./deck";
import m from "mithril";
import {button} from "./utils";

export let Splash = {
    makeDeck: () => {
        window.CurrentDeck = new Deck(prompt("What would you like to name the deck?", "New Deck"), prompt("What is your name? (Optional)"), []);
        m.route.set(EDITOR_PATH);
    },
    loadDeck: () => alert("TODO"),
    view: () => [
        m(".heading", [
            m("h1.title", "Trelane"),
            m("h2.subtitle", "A semi-competent SRS"),
        ]),
        m(".buttons", [
            button("New Deck", Splash.makeDeck, "primary"),
            button("Load Deck", Splash.loadDeck)
        ])
    ]
}