import m from "mithril";
import {Storage as Saver, Storage, Storage as storage} from "./storage";
import {Deck} from "./deck";
import {Card} from "./card";
import {EDITOR_PATH, HELP_PATH, LEARN_PATH, REVIEW_PATH, STORAGE_PASSWORD_KEY, STORAGE_USERNAME_KEY} from "./constants";
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

function attemptLogin(server, username, password) {
    console.log(`Attempting to login to ${server} as ${username}...`);
    
    
}

function convertDeckToLogseq(deck) {
    let string = `- # ${deck.name}\n- **Author:** ${deck.author}\n`;

    deck.cards.forEach(card => string += `- ${card.front} #card\n	- ${card.back}\n`);

    return string;
}

let showLoader = false;
let selectedFormat = null;
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
            m("label", {for: "load-file-select"}, "Import from file: "),
            m("select#load-file-select", {
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

let showSettings = false;
let Settings = {
    view: () => m(".modal", m(".content", [
        m(".heading", [
            m("h1.title", "Settings"),
            m("h2.subtitle", "Configure Trelane."),
        ]),
        m("p", [
            m("label", {for: "load-file-select"}, [
                "Server URL: ",
                m("select", {
                    value: Saver.getServerUrl(),
                    onchange: (e) => {
                        Saver.setServerUrl(e.target.value);
                        attemptLogin(e.target.value, Saver.getUsername(), Saver.getPassword());
                    },
                }, [
                    m("option", {value: "http://localhost:5226", selected: Saver.getServerUrl() === "http://localhost:5226"}, "Localhost"),
                    m("option", {value: "https://trelane.aceius.org", selected: Saver.getServerUrl() === "https://trelane.aceius.org"}, "Aceius.org")
                ])
            ])
        ]),
        m("p",
            m("label", [
                "Username: ",
                m("input", {
                    type: "text",
                    value: Saver.getUsername(),
                    onfocusout: (e) => {
                        Saver.setUsername(e.target.value);

                        if (Saver.getPassword() !== "") {
                            attemptLogin(Saver.getServerUrl(), e.target.value, Saver.getPassword());
                        }
                    },
                }),
            ])
        ),
        m("p",
            m("label", [
                "Password: ",
                m("input", {
                    type: "password",
                    value: Saver.getPassword(),
                    onfocusout: (e) => {
                        Saver.setPassword(e.target.value);

                        if (Saver.getUsername() !== "") {
                            attemptLogin(Saver.getServerUrl(), Saver.getUsername(), e.target.value);
                        }
                    },
                }),
            ])
        ),
        m("p", statusText),
        m(".buttons", [
            button("Close", () => showSettings = false)
        ])
    ]))
}

let statusText = "Welcome back! c:";
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
                    button("Settings", () => showSettings = true)
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
            m(".status", statusText)
        ]),
        showLoader && m(Loader),
        showSettings && m(Settings)
    ]
}