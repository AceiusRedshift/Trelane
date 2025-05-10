import m from "mithril";
import {Card} from "./card";
import {button, download} from "./utils";
import {Storage} from "./storage";
import {LEARN_PATH, REVIEW_PATH, SPLASH_PATH} from "./constants";

let showExportModal = false;

function makeTable() {
    let deck = Storage.getActiveDeck();
    let table = [];

    deck.cards = deck.cards.filter(card => card !== null);

    for (const index in deck.cards) {
        const i = Number(index);
        let card = deck.cards[i];

        table.push(
            m("tr", [
                m("td", m("input.card-input", {
                    value: card.front,
                    placeholder: `Term ${Number(i) + 1}`,
                    oninput: e => {
                        deck.cards[i].front = e.target.value;
                        Storage.setActiveDeck(deck);
                    }
                })),
                m("td", m("input.card-input", {
                    value: card.back,
                    placeholder: `Definition ${Number(i) + 1}`,
                    oninput: e => {
                        deck.cards[i].back = e.target.value;
                        Storage.setActiveDeck(deck);
                    },
                    onkeypress: e => {
                        let keyCode = e.code || e.key;
                        let validKeyCode = keyCode == "Enter";
                        if (validKeyCode && i === deck.cards.length - 1) {
                            addNewCard();
                        }
                    }
                })),
                m("td.last", [
                    i === 0 ? m("a.disabled", "↑") : m("a", {
                        onclick: () => {
                            let hold = deck.cards[i];

                            deck.cards[i] = deck.cards[i - 1];
                            deck.cards[i - 1] = hold;

                            Storage.setActiveDeck(deck);
                        }
                    }, "↑"),
                    i === deck.cards.length - 1 ? m("a.disabled", "↓") : m("a", {
                        onclick: () => {
                            let hold = deck.cards[i];

                            deck.cards[i] = deck.cards[i + 1];
                            deck.cards[i + 1] = hold;

                            Storage.setActiveDeck(deck);
                        }
                    }, "↓"),
                    m("a", {
                        onclick: () => {
                            if (confirm("Are you sure you want to delete this card?")) {
                                deck.cards.splice(i, 1);
                                Storage.setActiveDeck(deck);
                            }
                        }
                    }, "×")
                ]),
            ])
        );
    }

    return m("table", table);
}

function addNewCard() {
    let deck = Storage.getActiveDeck();
    deck.cards.push(new Card("", ""));
    Storage.setActiveDeck(deck);
}

export let Edit = {
    oninit: () => {
        showExportModal = false;
    },
    view: () => {
        let deck;

        if (Storage.hasActiveDeck()) {
            deck = Storage.getActiveDeck();
        } else {
            m.route.set(SPLASH_PATH);
            return;
        }

        let content = deck.cards.length === 0 ? m("p", "No cards in deck.") : makeTable();

        return [
            m(".heading", [
                m("h1.title", m("input", {
                    value: deck.name,
                    placeholder: `Deck Name`,
                    onfocusout: e => {
                        deck.name = e.target.value;
                        Storage.setActiveDeck(deck);
                    }
                })),
                m("h2.subtitle", [
                    "By ",
                    m("input", {
                        value: deck.author,
                        placeholder: `Author`,
                        onfocusout: e => {
                            deck.author = e.target.value;
                            Storage.setActiveDeck(deck);
                        }
                    })
                ]),
            ]),
            m("p", [
                m("label", [
                    `Save to cloud? `,
                    m("input", {
                        type: "checkbox", oninput: e => {
                            let meta = Storage.getActiveDeckMeta();

                            meta.sync = e.target.checked;

                            Storage.setActiveDeckMeta(meta);
                        }
                    })
                ]),
                Storage.getActiveDeckMeta().sync && m("label", [
                    " | Public: ",
                    m("input", {
                        type: "checkbox",
                        oninput: e => {
                            let meta = Storage.getActiveDeckMeta();

                            meta.isPublic = e.target.checked;

                            Storage.setActiveDeckMeta(meta);
                        }
                    })
                ]),
            ]),
            content,
            m("br"),
            m(".buttons", [
                button("New Card", addNewCard, "primary"),
                button("Learn Deck", () => {
                    Storage.setActiveDeck(deck);
                    m.route.set(LEARN_PATH);
                }),
                button("Review Deck", () => {
                    Storage.setActiveDeck(deck);
                    m.route.set(REVIEW_PATH);
                }),
                button("Save/Export", () => {
                    Storage.setActiveDeck(deck);
                    showExportModal = true;
                }),
                button("Back", () => m.route.set(SPLASH_PATH))
            ]),
        ]
    }
}