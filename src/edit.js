import m from "mithril";
import {Card} from "./card";
import {bailToSplashIfDeckIsNull, button, isNull} from "./utils";

function makeTable() {
    let table = [];

    for (const i in CurrentDeck.cards) {
        let card = CurrentDeck.cards[i];

        table.push(
            m("tr", [
                m("td", m("input.card-input", {
                    value: card.front,
                    placeholder: `Card ${Number(i) + 1} Front`,
                    oninput: e => {
                        CurrentDeck.cards[i].front = e.target.value;
                    }
                })),
                m("td", m("input.card-input", {
                    value: card.back,
                    placeholder: `Card ${Number(i) + 1} Back`,
                    oninput: e => {
                        CurrentDeck.cards[i].back = e.target.value;
                    }
                })),
                m("td.last", [
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

        bailToSplashIfDeckIsNull();

        let content = deck.cards.length === 0 ? m("p", "No cards in deck.") : makeTable();

        return [
            m("h1", deck.name),
            m("p", `Author: ${deck.author}`),
            m("p", "(Just click and start typing to edit!)"),
            content,
            m("br"),
            m(".buttons", [
                button("New Card", () => deck.cards.push(new Card("", "")), "primary"),
                button("Review Cards", () => m.route.set(REVIEW_PATH)),
                button("Back", () => m.route.set(SPLASH_PATH))
            ])
        ]
    }
}