import {closeButton, download, FileActions, isValidDeck} from "./utils";
import {
    EDITOR_PATH,
    HELP_PATH,
    LEARN_PATH,
    REVIEW_PATH
} from "./constants";
import {InnerDeck} from "./innerDeck";
import {Settings} from "./settings";
import {Network} from "./network";
import {Storage} from "./storage";
import m from "mithril";

// @ts-ignore
import {version} from "../package.json";

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
    className: disabled() ? "disabled dropdown-button" : "dropdown-button"
}, text);

function convertCsvToDeck(text: string): InnerDeck {
    const lines = text.split("\n");
    return new InnerDeck("Imported Deck", "Unknown", lines.map(line => {
        const [front, back] = line.split(",").map(s => s.trim());
        return {front, back};
    }).filter(card => card.front && card.back));
}

function convertDeckToCsv(deck: InnerDeck) {
    let string = "";

    deck.cards.forEach(card => string += `${card.front}, ${card.back}\n`);

    return string;
}

function convertDeckToLogseq(deck: InnerDeck) {
    let string = `- # ${deck.name}\n- **Author:** ${deck.author}\n`;

    deck.cards.forEach(card => string += `- ${card.front} #card\n	- ${card.back}\n`);

    return string;
}

let showLoader = false;
let loaderTab = 0;
let selectedFormat: string | null = null;
let remoteDecks: InnerDeck[] = [];
let Loader = {
    fetchRemoteDecks() {
        Network.downloadMyDecks().then(response => {
            remoteDecks = <InnerDeck[]>response;
            console.log(response);
        }).catch(error => {
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
        m(".buttons", [
            m("button", {className: loaderTab === 0 ? "primary" : "", onclick: () => loaderTab = 0}, "Local Decks"),
            Storage.hasCredentials() && m("button", {
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
            Storage.decks.length === 0 ? m("p", "No decks saved :c") : m("table", Storage.decks.map((deckRecord, i, decks) => {
                let deck = deckRecord.inner_deck;

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
                                    Storage.decks.splice(i, 1);
                                }
                            }
                        }, "Delete")
                    ])
                ]);
            }))
        ),
        loaderTab === 1 && (
            remoteDecks == null || remoteDecks.length === 0 ? m("p", "No decks on cloud :c") : m("table", remoteDecks.map((deck, i, decks) => {
                const loadDeck = () => {
                    if (Storage.activeDeck != null && !confirm("Are you sure you want to load a new deck? Any unsaved changes will be lost.")) {
                        return;
                    }

                    Storage.activeDeck = Storage.decks[(i)];
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
                                    Storage.decks.splice(i, 1);
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
                    onchange: (e: { target: { value: string | null; }; }) => selectedFormat = e.target.value
                }, [
                    m("option", {value: "", disabled: true, selected: selectedFormat == null}, "Select file format..."),
                    m("option", {value: "json", selected: selectedFormat === "json"}, "Trelane JSON"),
                    m("option", {value: "csv", selected: selectedFormat === "csv"}, "Generic CSV")
                ]),
            ]),
            selectedFormat && m("p", m("input", {
                type: "file",
                accept: selectedFormat === "json" ? ".json" : ".csv",
                onchange: (e: {
                    target: { files: { text: () => Promise<string>; }[]; };
                }) => e.target.files[0].text().then(text => {
                    try {
                        let potentialDeck = selectedFormat === "json" ? JSON.parse(text.toString()) : convertCsvToDeck(text);

                        if (isValidDeck(potentialDeck)) {
                            Storage.activeDeck = potentialDeck;
                            m.route.set(EDITOR_PATH);
                            showLoader = false;
                        } else {
                            alert("Malformed deck file.");
                        }
                    } catch (e) {
                        // @ts-ignore
                        alert(`Error parsing deck file: ${e.toString().replace("\n", "")}`);
                    }
                })
            }))
        ],
        closeButton(() => showLoader = false)
    ]))
}

let showAbout = false;
let About = {
    view: () => m(".modal", m(".content", [
        closeButton(() => showAbout = false),
        m("h1", [
            m("img", {src: "favicon.png", width: 24, height: 24}),
            " Trelane " + version
        ]),
        m("p", "Trelane is a FOSS memorization tool with optional cloud sync functionality."),
        m("p", [
            "Powered by ",
            m("a", {href: "https://mithril.js.org", target: "_blank"}, "Mithril.js"),
        ]),
    ]))
}

let showSettings = false;
export let Toolbar = {
    statusText: "Loading...",
    showLoader: () => showLoader = true,
    hideSettings: () => showSettings = false,
    view: () => [
        m(".toolbar", [
            m(".dropdown", [
                m(".dropdown-button", "File"),
                m(".dropdown-content", [
                    button("New", FileActions.newDeck),
                    button("Open", () => showLoader = true),
                    button("Save to file", () => download(JSON.stringify(Storage.activeDeck?.inner_deck), Storage.activeDeck?.name + ".json", "application/json"), () => Storage.activeDeck == null),
                    button("Export to CSV", () => download(convertDeckToCsv(<InnerDeck>Storage.activeDeck?.inner_deck), Storage.activeDeck?.name + ".csv", "text/csv"), () => Storage.activeDeck == null),
                    button("Export to Logseq", () => download(convertDeckToLogseq(<InnerDeck>Storage.activeDeck?.inner_deck), Storage.activeDeck?.name + ".md", "text/markdown"), () => Storage.activeDeck == null),
                    button("Settings", () => showSettings = true)
                ]),
            ]),
            m(".dropdown", [
                m(".dropdown-button", "Deck"),
                m(".dropdown-content", [
                    button("Edit", () => m.route.set(EDITOR_PATH), () => Storage.activeDeck == null),
                    button("Learn (Quiz)", () => m.route.set(LEARN_PATH), () => Storage.activeDeck == null),
                    button("Review (Flashcards)", () => m.route.set(REVIEW_PATH), () => Storage.activeDeck == null)
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