import m from "mithril";
import {button} from "./button";
import {Card} from "./card";

function generateCardHyperscript() {
    let hyperscript = [
        m("tr", [
            m("th", "Front"),
            m("th", "Back"),
            m("th", "Options")
        ])
    ];

    for (const card of CurrentDeck.cards) {
        hyperscript.push(
            m("tr", [
                m("td", card.front),
                m("td", card.back),
                m("td", "edit delete"),
            ])
        );
    }

    return m("table", hyperscript);
}

export let Edit = {
    view: () => {
        if (CurrentDeck === null) {
            m.route.set(SPLASH_PATH);
        }

        let content = CurrentDeck.cards.length === 0 ? m("p", "No cards in deck.") : generateCardHyperscript();

        return [
            m("h1", CurrentDeck.name),
            content,
            m("br"),
            [
                button("New Card", () => {
                    CurrentDeck.cards.push(new Card(prompt("Card Front"), prompt("Card Back")))
                }, "primary")
            ]
        ]
    }
}