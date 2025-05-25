import m from "mithril";
import {Card} from "./card";
import {button} from "./utils";
import {Storage} from "./storage";
import {LEARN_PATH, REVIEW_PATH, SPLASH_PATH} from "./constants";

class EditView {
    addNewCard() {
        Storage.activeDeck?.inner_deck.cards.push(new Card("", ""));
    }

    buildTable() {
        let deck = Storage.activeDeck?.inner_deck;
        if (deck == null) {
            return [];
        }

        let table = [];

        for (const index in Storage.activeDeck?.inner_deck.cards) {
            const i = Number(index);
            let card = Storage.activeDeck?.inner_deck.cards[i];

            table.push(
                m("tr", [
                    m("td", m("input.card-input", {
                        value: card.front,
                        placeholder: `Term ${Number(i) + 1}`,
                        oninput: (e: { target: { value: string; }; }) => {
                            Storage.activeDeck.inner_deck.cards[i].front = e.target.value;
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
                                this.addNewCard();
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

    view(): any {
        let record = Storage.activeDeck;

        if (record == null) {
            m.route.set(SPLASH_PATH);
            console.log("No active deck, returning to menu.")
            return [];
        }
        
        let deck = record.inner_deck;
        
        let content = deck.cards.length === 0 ? m("p", "No cards in deck.") : this.buildTable();

        return [
            m(".heading", [
                m("h1.title", m("input", {
                    value: deck.name,
                    placeholder: `Deck Name`,
                    onfocusout: (e: { target: { value: string; }; }) => {
                        Storage.activeDeck.inner_deck.name = e.target.value;
                    }
                })),
                m("h2.subtitle", [
                    "By ",
                    m("input", {
                        value: deck.author,
                        placeholder: `Author`,
                        onfocusout: (e: { target: { value: string; }; }) => {
                            Storage.activeDeck.inner_deck.author = e.target.value;
                        }
                    })
                ]),
            ]),
            m(".buttons", [
                button("Learn Terms", () => {
                    Storage.activeDeck.inner_deck = deck;
                    m.route.set(LEARN_PATH);
                }),
                button("Review Flashcards", () => {
                    Storage.activeDeck.inner_deck = deck;
                    m.route.set(REVIEW_PATH);
                }),
                button("Close Deck", () => m.route.set(SPLASH_PATH))
            ]),
            Storage.hasCredentials() && m("p", [
                m("label", [
                    `Save to cloud? `,
                    m("input", {
                        checked: !deck.local,
                        type: "checkbox", oninput: (e: { target: { checked: boolean; }; }) => {
                            deck.local = !e.target.checked;
                            Storage.activeDeck.inner_deck = deck;
                        }
                    })
                ]),
                !Storage.activeDeck?.local && m("label", [
                    " | Public: ",
                    m("input", {
                        checked: Storage.activeDeck?.is_public,
                        type: "checkbox",
                        oninput: (e: { target: { checked: boolean; }; }) => {
                            Storage.activeDeck.inner_deck.author = Storage.email;
                            Storage.activeDeck.is_public = e.target.checked;
                        }
                    })
                ]),
            ]),
            content,
            m(".buttons", [
                button("New Card", this.addNewCard, "primary")
            ]),
        ];
    }
}

export let Edit = new EditView();