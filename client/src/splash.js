import m from "mithril";
import {Deck} from "./deck";
import {Card} from "./card";
import {Storage as Saver, Storage} from "./storage";
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

let Loader = {
    view: () => m(".modal", m(".content",[
        m(".heading", [
            m("h1.title", "Load"),
            m("h2.subtitle", "Restore or import a deck."),
        ]),
        m(".buttons", [
            button("Back", () => showLoader = false),
            m("select", {
                value: selectedFormat || "",
                onchange: (e) => selectedFormat = e.target.value
            }, [
                m("option", {value: "", disabled: true, selected: true}, "Select file format..."),
                m("option", {value: "json"}, "Trelane JSON"),
                m("option", {value: "csv"}, "Generic CSV")
            ]),
            selectedFormat && m("input", {
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
            })
        ])
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
                Storage.setActiveDeck(new Deck("New Deck", "You!", [new Card("", "")]));
                m.route.set(EDITOR_PATH);
            }, Storage.hasActiveDeck() ? "" : "primary"),
            button("Load Deck", () => showLoader = true),
            button("Help", () => m.route.set(HELP_PATH))
        ]),
        showLoader && m(Loader)
    ]
}