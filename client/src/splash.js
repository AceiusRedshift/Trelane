import m from "mithril";
import {Deck} from "./deck";
import {Card} from "./card";
import {Storage as storage, Storage as Saver, Storage} from "./storage";
import {button, isValidDeck} from "./utils";
import {EDITOR_PATH, HELP_PATH} from "./constants";

let showLoader = false;
let selectedFormat = null;

function convertCsvToDeck(text) {
    const lines = text.split("\n");
    return {
        name: "Imported Deck",
        author: "Unknown",
        cards: lines.map(line => {
            const [front, back] = line.split(",").map(s => s.trim());
            return {front, back};
        }).filter(card => card.front && card.back)
    };
}

function makeTable() {
    let decks = Storage.getDecks();
    let table = [];

    for (const d in decks) {
        const i = Number(d);
        let deck = decks[i];

        const loadDeck = () => {
            if (Storage.hasActiveDeck() && !confirm("Are you sure you want to load a new deck? Any unsaved changes will be lost.")) {
                return;
            }

            Storage.setActiveDeck(storage.getDeck(i));
            m.route.set(EDITOR_PATH);
        }

        table.push(m("tr.load-table", [
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
        ]));
    }

    return table;
}

let Loader = {
    view: () => m(".modal", m(".content", [
        m(".heading", [
            m("h1.title", "Load"),
            m("h2.subtitle", "Restore or import a deck."),
        ]),
        Storage.getDecks().length === 0 ? m("p", "No decks saved :c") : m("table", makeTable()),
        m("p", [
            "Import from file: ",
            m("select", {
                value: selectedFormat || "",
                onchange: (e) => selectedFormat = e.target.value
            }, [
                m("option", {value: "", disabled: true, selected: selectedFormat == null}, "Select file format..."),
                m("option", {value: "json", selected: selectedFormat === "json"}, "Trelane JSON"),
                m("option", {value: "csv", selected: selectedFormat === "csv"}, "Generic CSV")
            ]),
        ]),
        selectedFormat && m("p", m("input", {
            type: "file",
            accept: selectedFormat === "json" ? ".json" : ".csv",
            onchange: e => e.target.files[0].text().then(text => {
                try {
                    let potentialDeck = selectedFormat === "json" ? JSON.parse(text.toString()) : convertCsvToDeck(text);

                    if (isValidDeck(potentialDeck)) {
                        Saver.setActiveDeck(potentialDeck);
                        m.route.set(EDITOR_PATH);
                    } else {
                        alert("Malformed deck file.");
                    }
                } catch (e) {
                    alert("Error parsing deck file: " + e.toString().replace("\n", ""));
                }
            })
        })),
        m(".buttons", button("Back", () => showLoader = false))
    ]))
}

export let Splash = {
    oninit: () => showLoader = false,
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
            button("Load Deck", () => showLoader = true),
            button("Help", () => m.route.set(HELP_PATH))
        ]),
        showLoader && m(Loader)
    ]
}