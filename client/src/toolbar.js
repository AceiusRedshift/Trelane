import m from "mithril";
import {Storage as Saver, Storage, Storage as storage} from "./storage";
import {Deck} from "./deck";
import {Card} from "./card";
import {EDITOR_PATH, HELP_PATH, LEARN_PATH, REVIEW_PATH} from "./constants";
import {download, isValidDeck} from "./utils";

/**
 * Special toolbar button
 * @param text The text to show
 * @param click The function to run on click
 * @param disabled When true, this button is disabled
 * @returns {m.Vnode<any, any>} A button virtual node
 */
const button = (text, click, disabled = () => false) => m("button", {
    onclick: !disabled() && click,
    className: disabled() && "disabled"
}, text);

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

function convertDeckToCsv(deck) {
    let string = "";

    deck.cards.forEach(card => string += `${card.front}, ${card.back}\n`);

    return string;
}

function convertDeckToLogseq(deck) {
    let string = `- # ${deck.name}\n- **Author:** ${deck.author}\n`;

    deck.cards.forEach(card => string += `- ${card.front} #card\n	- ${card.back}\n`);

    return string;
}

let Loader = {
    view: () => m(".modal", m(".content", [
        m(".heading", [
            m("h1.title", "Load"),
            m("h2.subtitle", "Restore or import a deck."),
        ]),
        Storage.getDecks().length === 0 ? m("p", "No decks saved :c") : m("table", Storage.getDecks().map((deck, i, decks) => {
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

export let Toolbar = {
    view: () => [
        m(".toolbar", [
            m(".dropdown", [
                m(".dropdown-button", "File"),
                m(".dropdown-content", [
                    button("New", () => {
                        if (storage.hasActiveDeck() && !confirm("Are you sure you want to create a new deck? One is already loaded, so this will overwrite it.")) {
                            return;
                        }

                        Storage.setActiveDeck(new Deck("New Deck", "You!", [new Card("", "")]));
                        m.route.set(EDITOR_PATH);
                    }),
                    button("Open", () => showLoader = true),
                    button("Save to file", () => download(JSON.stringify(Saver.getActiveDeck()), Saver.getActiveDeck().name + ".json", "application/json"), () => !Saver.hasActiveDeck()),
                    button("Export to CSV", () => download(convertDeckToCsv(Saver.getActiveDeck()), Saver.getActiveDeck().name + ".csv", "text/csv"), () => !Saver.hasActiveDeck()),
                    button("Export to Logseq", () => download(convertDeckToLogseq(Saver.getActiveDeck()), Saver.getActiveDeck().name + ".md", "text/markdown"), () => !Saver.hasActiveDeck()),
                ]),
            ]),
            m(".dropdown", [
                m(".dropdown-button", "Deck"),
                m(".dropdown-content", [
                    button("Edit", () => m.route.set(EDITOR_PATH), () => !Saver.hasActiveDeck()),
                    button("Learn (Quiz)", () => m.route.set(LEARN_PATH), () => !Saver.hasActiveDeck()),
                    button("Review (Flashcards)", () => m.route.set(REVIEW_PATH), () => !Saver.hasActiveDeck())
                ]),
            ]),
            m(".dropdown", [
                m(".dropdown-button", "Help"),
                m(".dropdown-content", [
                    button("View Help", () => m.route.set(HELP_PATH))
                ]),
            ]),
            m(".status", "Welcome back :D")
        ]),
        showLoader && m(Loader)
    ]
}