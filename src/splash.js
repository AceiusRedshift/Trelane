import {Deck} from "./deck";
import {button} from "./button";
import m from "mithril";

export let Splash = {
    makeDeck: () => {
        CurrentDeck = new Deck(prompt("What would you like to name the deck?", "New Deck"), prompt("What is your name? (Optional)"), [])
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