import m from "mithril";
import {Saver} from "./saver";
import {button, isValidDeck} from "./utils";
import {EDITOR_PATH, SPLASH_PATH} from "./constants";

export let Load = {
    view: () => [
        m(".heading", [
            m("h1.title", "Load"),
            m("h2.subtitle", "Restore or import a deck."),
        ]),
        m(".buttons", [
            button("Back", () => m.route.set(SPLASH_PATH)),
            m("input", {
                type: "file", onchange: e => e.target.files[0].text().then(text => {
                    let potentialDeck = JSON.parse(text);

                    if (isValidDeck(potentialDeck)) {
                        Saver.setDeck(potentialDeck);
                        m.route.set(EDITOR_PATH);
                    } else {
                        alert("Malformed deck file.");
                    }
                }).catch(e => alert("Error parsing deck file: " + e.toString().replace("\n", "")))
            })
        ])
    ]
}