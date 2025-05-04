import m from "mithril";
import {Card} from "./card";
import {button, isNull} from "./utils";

function makeTable() {
    let table = [
        m("tr", [
            m("th", "Front"),
            m("th", "Back"),
            m("th", "Options")
        ])
    ];

    for (const i in CurrentDeck.cards) {
        let card = CurrentDeck.cards[i];

        table.push(
            m("tr", [
                m("td", card.front),
                m("td", card.back),
                m("td", [
                    m("a", {
                        onclick: () => {
                            CurrentDeck.cards[i] = new Card(prompt("New Front", card.front), prompt("New Back", card.back))
                        }
                    }, "edit"),
                    m("span", " "),
                    m("a", {
                        onclick: () => {
                            if (confirm("Are you sure you want to delete this card?")) {
                                CurrentDeck.cards.splice(i, 1);
                            }
                        }
                    }, "delete"),
                ]),
            ])
        );
    }

    return m("table", table);
}

export let Edit = {
    view: () => {
        let deck = CurrentDeck;

        if (isNull(deck)) {
            m.route.set(SPLASH_PATH);
            return;
        }

        if (!deck || !Array.isArray(deck.cards)) {
            console.error('Invalid deck structure');
            m.route.set(SPLASH_PATH);
            return;
        }

        console.log(deck);
        let content = deck.cards.length === 0 ? m("p", "No cards in deck.") : makeTable();

        return [
            m("h1", deck.name),
            m("p", `Author: ${deck.author}`),
            content,
            m("br"),
            m(".buttons", [
                button("New Card", () => {
                    deck.cards.push(new Card(prompt("Card Front"), prompt("Card Back")))
                }, "primary"),
                button("Home", () => {
                    m.route.set(SPLASH_PATH);
                })
            ])
        ]
    }
}