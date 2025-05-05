import m from "mithril";
import {Card} from "./card";
import {button, download} from "./utils";
import {Saver} from "./saver";

function makeTable() {
    let deck = Saver.getDeck();
    let table = [];

    for (const i in deck.cards) {
        let card = deck.cards[i];

        table.push(
            m("tr", [
                m("td", m("input.card-input", {
                    value: card.front,
                    placeholder: `Card ${Number(i) + 1} Front`,
                    oninput: e => {
                        deck.cards[i].front = e.target.value;
                        Saver.setDeck(deck);
                    }
                })),
                m("td", m("input.card-input", {
                    value: card.back,
                    placeholder: `Card ${Number(i) + 1} Back`,
                    oninput: e => {
                        deck.cards[i].back = e.target.value;
                        Saver.setDeck(deck);
                    }
                })),
                m("td.last", [
                    m("a", {
                        onclick: () => {
                            if (confirm("Are you sure you want to delete this card?")) {
                                deck.cards.splice(i, 1);
                                Saver.setDeck(deck);
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
        let deck;

        if (Saver.deckSaved()) {
            deck = Saver.getDeck();
        } else {
            m.route.set(SPLASH_PATH);
            return;
        }

        let content = deck.cards.length === 0 ? m("p", "No cards in deck.") : makeTable();

        return [
            m(".heading", [
                m("h1.title", deck.name),
                m("h2.subtitle", `By ${deck.author}`),
            ]),
            m("p", "(Just click and start typing to edit!)"),
            content,
            m("br"),
            m(".buttons", [
                button("New Card", () => {
                    deck.cards.push(new Card("", ""));
                    Saver.setDeck(deck);
                }, "primary"),
                button("Review Deck", () => m.route.set(REVIEW_PATH)),
                button("Save Deck", () => download(JSON.stringify(deck), deck.name + ".json", "application/json")),
                button("Back", () => m.route.set(SPLASH_PATH))
            ])
        ]
    }
}