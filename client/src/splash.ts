import m from "mithril";
import {Deck} from "./deck";
import {Card} from "./card";
import {Storage as storage, Storage as Saver, Storage} from "./storage";
import {button, FileActions, isValidDeck} from "./utils";
import {EDITOR_PATH, HELP_PATH} from "./constants";
import {Toolbar} from "./toolbar";
import {Edit} from "./edit";
import {Network} from "./network";

let showExplore = false;
let exploreDecks: Deck[] | null = [];
let Explore = {
    fetchDecks: () => {
        Network.exploreDecks().then((response) => {
            exploreDecks = response;
            console.log(response);
        }).catch((error) => {
            Toolbar.statusText = "Explore Error: " + error.message;

            if (error.message === "Request timed out") {
                Toolbar.statusText = (navigator.onLine ? "Server" : "You're") + " offline."
            }
        });
    },
    view: () => m(".modal", m(".content", [
        m(".heading", [
            m("h1.title", "Explore"),
            m("h2.subtitle", `Discover popular decks from ${Storage.getServerUrl()}.`),
        ]),
        m("br"),
        (exploreDecks == null || exploreDecks.length === 0) ? m("p", "No decks on cloud :c") :
            m("table", exploreDecks.map((deck, i, _) => {
                const loadDeck = () => {
                    if (Storage.hasActiveDeck() && !confirm("Are you sure you want to load a new deck? Any unsaved changes will be lost.")) {
                        return;
                    }

                    Storage.setActiveDeck(storage.getDeck(i));
                    m.route.set(EDITOR_PATH);
                }

                return m("tr.load-table", [
                    m("td", {onclick: loadDeck}, deck.name),
                    m("td", {onclick: loadDeck}, deck.author),
                    m("td", {onclick: loadDeck}, deck.cards.length + " cards"),
                    m("td.load-table-solid", [
                        m("a", {onclick: loadDeck}, "Load"),
                        " ",
                        m("a", {
                            onclick: () => {
                                if (confirm("Are you sure you want to delete this deck?")) {
                                    Storage.removeDeck(i);
                                }
                            }
                        }, "Delete")
                    ])
                ]);
            })),
        m("br"),
        m(".buttons", button("Back", () => showExplore = false))
    ]))
}

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
        ]),
        m(".buttons", [
            button("Explore Decks Online", () => {
                showExplore = true;
                Explore.fetchDecks();
            }, "", "Discover decks published by other users of Trelane.")
        ]),
        showExplore && m(Explore),
    ])
}