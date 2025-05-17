import m from "mithril";
import {Storage as Saver, Storage, Storage as storage} from "./storage";
import {Deck} from "./deck";
import {Card} from "./card";
import {
    MAIN_SERVER,
    EDITOR_PATH,
    HELP_PATH,
    LEARN_PATH,
    LOCAL_SERVER,
    REVIEW_PATH
} from "./constants";
import {download, FileActions, isValidDeck, validateAccount} from "./utils";
import {Network} from "./network";

/**
 * Special toolbar button
 * @param text The text to show
 * @param click The function to run on click
 * @param disabled When true, this button is disabled
 * @returns {m.Vnode<any, any>} A button virtual node
 */
const button = (text: string, click: () => any, disabled = () => false): m.Vnode<any, any> => m("button", {
    // @ts-ignore
    onclick: !disabled() && click,
    className: disabled() && "disabled"
}, text);

function convertCsvToDeck(text: string): Deck {
    const lines = text.split("\n");
    return new Deck("Imported Deck", "Unknown", lines.map(line => {
        const [front, back] = line.split(",").map(s => s.trim());
        return {front, back};
    }).filter(card => card.front && card.back));
}

function convertDeckToCsv(deck: Deck) {
    let string = "";

    deck.cards.forEach(card => string += `${card.front}, ${card.back}\n`);

    return string;
}

function convertDeckToLogseq(deck: Deck) {
    let string = `- # ${deck.name}\n- **Author:** ${deck.author}\n`;

    deck.cards.forEach(card => string += `- ${card.front} #card\n	- ${card.back}\n`);

    return string;
}

let showLoader = false;
let loaderTab = 0;
let selectedFormat: string | null = null;
let remoteDecks: Deck[] = [];
let Loader = {
    fetchRemoteDecks() {
        Network.downloadDecks().then((response) => {
            remoteDecks = <Deck[]>response;
            console.log(response);
        }).catch((error) => {
            Toolbar.statusText = "Load Error: " + error.message;

            if (error.message === "Request timed out") {
                Toolbar.statusText = (navigator.onLine ? "Server" : "You're") + " offline."
            }
        });
    },

    oninit: () => {
        Loader.fetchRemoteDecks();
    },
    view: () => m(".modal", m(".content", [
        m(".heading", [
            m("h1.title", "Load"),
            m("h2.subtitle", "Restore or import a deck."),
        ]),
        m(".buttons", [
            m("button", {className: loaderTab === 0 ? "primary" : "", onclick: () => loaderTab = 0}, "Local Decks"),
            Saver.hasAccount() && m("button", {
                className: loaderTab === 1 ? "primary" : "", onclick: () => {
                    if (loaderTab !== 1) {
                        Loader.fetchRemoteDecks();
                        loaderTab = 1;
                    }
                }
            }, "Cloud Decks"),
            m("button", {className: loaderTab === 2 ? "primary" : "", onclick: () => loaderTab = 2}, "Import")
        ]),
        m("br"),
        loaderTab === 0 && (
            Storage.getDecks().length === 0 ? m("p", "No decks saved :c") : m("table", Storage.getDecks().map((deck, i, decks) => {
                const loadDeck = () => FileActions.loadDeck(i);

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
            }))
        ),
        loaderTab === 1 && (
            (remoteDecks == null || remoteDecks.length === 0) ? m("p", "No decks on cloud :c") : m("table", remoteDecks.map((deck, i, decks) => {
                const loadDeck = () => {
                    if (Storage.hasActiveDeck() && !confirm("Are you sure you want to load a new deck? Any unsaved changes will be lost.")) {
                        return;
                    }

                    Storage.setActiveDeck(storage.getDeck(i));
                    m.route.set(EDITOR_PATH);
                    showLoader = false;
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
            }))
        ),
        loaderTab === 2 && [
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
                onchange: e => e.target.files[0].text().then(t => {
                    let text = <string>t;
                    
                    try {
                        let potentialDeck = selectedFormat === "json" ? JSON.parse(text.toString()) : convertCsvToDeck(text);

                        if (isValidDeck(potentialDeck)) {
                            Saver.setActiveDeck(potentialDeck);
                            m.route.set(EDITOR_PATH);
                            showLoader = false;
                        } else {
                            alert("Malformed deck file.");
                        }
                    } catch (e) {
                        alert("Error parsing deck file: " + e.toString().replace("\n", ""));
                    }
                })
            }))
        ],
        m("br"),
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
                        validateAccount(e.target.value, Saver.getUsername(), Saver.getPassword());
                    },
                }, [
                    m("option", {value: LOCAL_SERVER, selected: Saver.getServerUrl() === LOCAL_SERVER}, "Localhost"),
                    m("option", {value: MAIN_SERVER, selected: Saver.getServerUrl() === MAIN_SERVER}, "Aceius.org")
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

                        if (Saver.getPassword() !== "" && Saver.hasAccount()) {
                            validateAccount(Saver.getServerUrl(), e.target.value, Saver.getPassword());
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

                        if (Saver.getUsername() !== "" && Saver.hasAccount()) {
                            validateAccount(Saver.getServerUrl(), Saver.getUsername(), e.target.value);
                        }
                    },
                }),
            ])
        ),
        m("p", Toolbar.statusText),
        m(".buttons", [
            button("Close", () => showSettings = false)
        ])
    ]))
}

let showAbout = false;
let About = {
    view: () => m(".modal", m(".content", [
        m("h1", [
            m("img", {src: "favicon.png", width: 24, height: 24}),
            " Trelane"
        ]),
        m("p", "Trelane is a FOSS memorization tool with optional cloud sync functionality."),
        m("p", [
            "Powered by ",
            m("a", {href: "https://mithril.js.org"}, "Mithril.js"),
        ]),
        m(".buttons", [
            button("Close", () => showAbout = false)
        ])
    ]))
}

export let Toolbar = {
    statusText: "Loading...",
    showLoader: () => showLoader = true,
    view: () => [
        m(".toolbar", [
            m(".dropdown", [
                m(".dropdown-button", "File"),
                m(".dropdown-content", [
                    button("New", FileActions.newDeck),
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
                    button("View Help", () => m.route.set(HELP_PATH)),
                    button("Dump Data", () => Storage.dump()),
                    button("About...", () => showAbout = true),
                ]),
            ]),
            m(".status", Toolbar.statusText)
        ]),
        showLoader && m(Loader),
        showSettings && m(Settings),
        showAbout && m(About)
    ]
}