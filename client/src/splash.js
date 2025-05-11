import m from "mithril";
import {Deck} from "./deck";
import {Card} from "./card";
import {Storage as storage, Storage as Saver, Storage} from "./storage";
import {button, FileActions, isValidDeck} from "./utils";
import {EDITOR_PATH, HELP_PATH} from "./constants";
import {Toolbar} from "./toolbar";
import {Edit} from "./edit";

export let Splash = {
    view: () => m(".splash", [
        m("header", [
            m("h1.title", "Trelane"),
            m("h2.subtitle", "A semi-competent memorization tool."),
        ]),
        m(".row-2.max-width", [
            m(".column", [
                m("h3", "Quick Start"),
                m("ul", [
                    m("li", m("button.link-button", {onclick: FileActions.newDeck}, "New Deck")),
                    m("li", m("button.link-button", {onclick: Toolbar.showLoader}, "Open Deck"))
                ])
            ]),
            Storage.getDecks().length > 0 && m(".column", [
                m("h3", "Recent"),
                m("ul", [
                    Storage.hasActiveDeck() && m("li", [
                        "Currently Editing: ",
                        m("button.link-button", {onclick: () => m.route.set(EDITOR_PATH)}, Storage.getActiveDeck().name)
                    ]),
                    Storage.getDecks().slice(-Math.min(Storage.getDecks().length, 5) + (Storage.hasActiveDeck() ? 1 : 0)).map((deck, i, _) => {
                        return m("li", m("button.link-button", {onclick: () => FileActions.loadDeck(i)}, deck.name));
                    })
                ])
            ])
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
    ])
}