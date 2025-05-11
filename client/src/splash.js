import m from "mithril";
import {Deck} from "./deck";
import {Card} from "./card";
import {Storage as storage, Storage as Saver, Storage} from "./storage";
import {button, FileActions, isValidDeck} from "./utils";
import {EDITOR_PATH, HELP_PATH} from "./constants";
import {Toolbar} from "./toolbar";
import {Edit} from "./edit";

export let Splash = {
    view: () => m("#splash", [
        m("header", [
            m("h1.title", "Trelane"),
            m("h2.subtitle", "A semi-competent memorization tool."),
        ]),
        m(".row-2.max-width", [
            m(".column", [
                m("h3", "Quick Actions"),
                m("ul", [
                    m("li", m("button.link-button", {onclick: FileActions.newDeck}, "New Deck")),
                    m("li", m("button.link-button", {onclick: Toolbar.showLoader}, "Open Deck")),
                    m("li", m("button.link-button", {onclick: () => m.route.set(HELP_PATH)}, "Help"))
                ])
            ]),
            Storage.getDecks().length > 0 && m(".column", [
                m("h3", "Recent"),
                m("ul", [
                    Storage.hasActiveDeck() && m("li", [
                        m("button.link-button", {onclick: () => m.route.set(EDITOR_PATH)}, Storage.getActiveDeck().name),
                        " (Currently editing)"
                    ]),
                    Storage.getDecks().slice(-Math.min(Storage.getDecks().length, 5) + (Storage.hasActiveDeck() ? 1 : 0)).map((deck, i, _) => {
                        return m("li", m("button.link-button", {onclick: () => FileActions.loadDeck(i)}, deck.name));
                    })
                ])
            ])
        ])
    ])
}