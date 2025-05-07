import m from "mithril";
import {Storage} from "./storage";
import {button, isValidDeck} from "./utils";
import {EDITOR_PATH, SPLASH_PATH} from "./constants";

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

export let Load = {
    view: () => [
        m(".heading", [
            m("h1.title", "Load"),
            m("h2.subtitle", "Restore or import a deck."),
        ]),
        m(".buttons", [
            button("Back", () => m.route.set(SPLASH_PATH)),
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
                            Storage.setActiveDeck(potentialDeck);
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
    ]
}