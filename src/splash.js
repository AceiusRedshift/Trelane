import {Deck} from "./deck";
import {button} from "./button";
import m from "mithril";

export let Splash = {
    makeDeck: () => {
        CurrentDeck = new Deck(prompt("What would you like to name the deck?", "New Deck"), prompt("What is your name? (Optional)"), [])
        m.route.set(EDITOR_PATH);
    },
    loadDeck: () => alert("TODO"),
    view: () => [
        m(".heading", [
            m("h1.title", "Trelane"),
            m("h2.subtitle", "A semi-competent SRS"),
        ]),
        m("#splash-bar", [
            button("New Deck", Splash.makeDeck),
            button("Load Deck", Splash.loadDeck, "accent")
        ])
    ]
}