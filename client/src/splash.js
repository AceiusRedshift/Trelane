import m from "mithril";
import {Deck} from "./deck";
import {Card} from "./card";
import {Storage as storage, Storage as Saver, Storage} from "./storage";
import {button, isValidDeck} from "./utils";
import {EDITOR_PATH, HELP_PATH} from "./constants";

export let Splash = {
    view: () => [
        m(".heading", [
            m("h1.title", "Trelane"),
            m("h2.subtitle", "A semi-competent memorization tool."),
        ]),
        m(".buttons", [
            Storage.hasActiveDeck() && button("Continue Editing", () => m.route.set(EDITOR_PATH), "primary"),
            button("New Deck", () => {
                if (storage.hasActiveDeck() && !confirm("Are you sure you want to create a new deck? One is already loaded, so this will overwrite it.")) {
                    return;
                }

                Storage.setActiveDeck(new Deck("New Deck", "You!", [new Card("", "")]));
                m.route.set(EDITOR_PATH);
            }, Storage.hasActiveDeck() ? "" : "primary"),
            button("Help", () => m.route.set(HELP_PATH))
        ])
    ]
}