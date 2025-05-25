import m from "mithril";
import {Card} from "./card";
import {button} from "./utils";
import {Storage} from "./storage";
import {LEARN_PATH, REVIEW_PATH, SPLASH_PATH} from "./constants";

function makeTable() {
    let deck = Storage.activeDeck?.inner_deck;
    if (!deck) {
        return [];
    }

    let table = [];

    for (const index in deck.cards) {
        const i = Number(index);
        let card = deck.cards[i];

        table.push(
            m("tr", [
                m("td", m("input.card-input", {
                    value: card.front,
                    placeholder: `Term ${Number(i) + 1}`,
                    oninput: (e: { target: { value: string; }; }) => {
                        deck.cards[i].front = e.target.value;
                        Storage.activeDeck = (deck);
                    }
                })),
                m("td", m("input.card-input", {
                    value: card.back,
                    placeholder: `Definition ${Number(i) + 1}`,
                    oninput: (e: { target: { value: string; }; }) => {
                        deck.cards[i].back = e.target.value;
                        Storage.setActiveDeck(deck);
                    },
                    onkeypress: (e: { code: any; key: any; }) => {
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

    return m("table.load-table", table);
}

function addNewCard() {
    let deck = Storage.getActiveDeck();
    deck.cards.push(new Card("", ""));
    Storage.setActiveDeck(deck);
}

export let Edit = {
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
                    onfocusout: (e: { target: { value: string; }; }) => {
                        deck.name = e.target.value;
                        Storage.setActiveDeck(deck);
                    }
                })),
                m("h2.subtitle", [
                    "By ",
                    m("input", {
                        value: deck.author,
                        placeholder: `Author`,
                        onfocusout: (e: { target: { value: string; }; }) => {
                            deck.author = e.target.value;
                            Storage.setActiveDeck(deck);
                        }
                    })
                ]),
            ]),
            m(".buttons", [
                button("Learn Terms", () => {
                    Storage.setActiveDeck(deck);
                    m.route.set(LEARN_PATH);
                }),
                button("Review Flashcards", () => {
                    Storage.setActiveDeck(deck);
                    m.route.set(REVIEW_PATH);
                }),
                button("Close Deck", () => m.route.set(SPLASH_PATH))
            ]),
            Storage.hasCredentials() && m("p", [
                m("label", [
                    `Save to cloud? `,
                    m("input", {
                        checked: Storage.getActiveDeckMeta().sync,
                        type: "checkbox", oninput: (e: { target: { checked: boolean; }; }) => {
                            let meta = Storage.getActiveDeckMeta();

                            meta.sync = e.target.checked;

                            Storage.setActiveDeckMeta(meta);
                        }
                    })
                ]),
                Storage.getActiveDeckMeta().sync && m("label", [
                    " | Public: ",
                    m("input", {
                        checked: Storage.getActiveDeckMeta().isPublic,
                        type: "checkbox",
                        oninput: (e: { target: { checked: boolean; }; }) => {
                            let deck = Storage.getActiveDeck();
                            let meta = Storage.getActiveDeckMeta();

                            deck.author = Storage.getEmail();
                            meta.isPublic = e.target.checked;

                            Storage.setActiveDeckMeta(meta);
                            Storage.setActiveDeck(deck);
                        }
                    })
                ]),
            ]),
            content,
            m(".buttons", [
                button("New Card", addNewCard, "primary")
            ]),
        ]
    }
}