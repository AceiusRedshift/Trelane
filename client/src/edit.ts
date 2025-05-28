import m from "mithril";
import {Card} from "./card";
import {button} from "./utils";
import {Storage} from "./storage";
import {LEARN_PATH, REVIEW_PATH, SPLASH_PATH} from "./constants";
import {Deck} from "./deck";
import {InnerDeck} from "./innerDeck";

class EditView {
    get activeDeck(): Deck {
        let active = Storage.activeDeck;

        if (!active) {
            m.route.set(SPLASH_PATH);
            return new Deck(new InnerDeck("ERROR", "ERROR", []));
        }

        return active;
    }

    updateActiveDeckDate() {
        let active = Storage.activeDeck;

        if (!active) {
            m.route.set(SPLASH_PATH);
            return new Deck(new InnerDeck("ERROR", "ERROR", []));
        }
        
        active.updated_at = new Date();
    }

    addNewCard() {
        let active = Storage.activeDeck;

        if (!active) {
            m.route.set(SPLASH_PATH);
            return new Deck(new InnerDeck("ERROR", "ERROR", []));
        }

        active.updated_at = new Date();
        active.inner_deck.cards.push(new Card("", ""));
    }

    buildTable() {
        let table = [];

        for (const index in this.activeDeck.inner_deck.cards) {
            const i = Number(index);
            let card = this.activeDeck.inner_deck.cards[i];

            table.push(
                m("tr", [
                    m("td", m("input.card-input", {
                        value: card.front,
                        placeholder: `Term ${Number(i) + 1}`,
                        oninput: (e: { target: { value: string; }; }) => {
                            this.activeDeck.inner_deck.cards[i].front = e.target.value;
                            this.updateActiveDeckDate();
                        }
                    })),
                    m("td", m("input.card-input", {
                        value: card.back,
                        placeholder: `Definition ${Number(i) + 1}`,
                        oninput: (e: { target: { value: string; }; }) => {
                            this.activeDeck.inner_deck.cards[i].back = e.target.value;
                            this.updateActiveDeckDate();
                        },
                        onkeypress: (e: { code: any; key: any; }) => {
                            let keyCode = e.code || e.key;
                            let validKeyCode = keyCode == "Enter";
                            if (validKeyCode && i === this.activeDeck.inner_deck.cards.length - 1) {
                                this.addNewCard();
                            }
                        }
                    })),
                    m("td.last", [
                        i === 0 ? m("a.disabled", "↑") : m("a", {
                            onclick: () => {
                                let hold = this.activeDeck.inner_deck.cards[i];

                                this.activeDeck.inner_deck.cards[i] = this.activeDeck.inner_deck.cards[i - 1];
                                this.activeDeck.inner_deck.cards[i - 1] = hold;

                                this.updateActiveDeckDate();
                            }
                        }, "↑"),
                        i === this.activeDeck.inner_deck.cards.length - 1 ? m("a.disabled", "↓") : m("a", {
                            onclick: () => {
                                let hold = this.activeDeck.inner_deck.cards[i];

                                this.activeDeck.inner_deck.cards[i] = this.activeDeck.inner_deck.cards[i + 1];
                                this.activeDeck.inner_deck.cards[i + 1] = hold;

                                this.updateActiveDeckDate();
                            }
                        }, "↓"),
                        m("a", {
                            onclick: () => {
                                if (confirm("Are you sure you want to delete this card?")) {
                                    this.activeDeck.inner_deck.cards.splice(i, 1);
                                }
                                this.updateActiveDeckDate();
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
                        this.activeDeck.inner_deck.name = e.target.value;
                    }
                })),
                m("h2.subtitle", [
                    "By ",
                    m("input", {
                        value: deck.author,
                        placeholder: `Author`,
                        onfocusout: (e: { target: { value: string; }; }) => {
                            this.activeDeck.inner_deck.author = e.target.value;
                        }
                    })
                ]),
            ]),
            m(".buttons", [
                button("Learn Terms", () => {
                    this.activeDeck.inner_deck = deck;
                    m.route.set(LEARN_PATH);
                }),
                button("Review Flashcards", () => {
                    this.activeDeck.inner_deck = deck;
                    m.route.set(REVIEW_PATH);
                }),
                button("Close Deck", () => m.route.set(SPLASH_PATH))
            ]),
            Storage.hasCredentials() && m("p", [
                m("label", [
                    `Save to cloud? `,
                    m("input", {
                        checked: !this.activeDeck.local,
                        type: "checkbox",
                        oninput: (e: { target: { checked: boolean; }; }) => this.activeDeck.local = !e.target.checked
                    })
                ]),
                !Storage.activeDeck?.local && m("label", [
                    " | Public: ",
                    m("input", {
                        checked: this.activeDeck.is_public,
                        type: "checkbox",
                        oninput: (e: { target: { checked: boolean; }; }) => {
                            this.activeDeck.inner_deck.author = Storage.email;
                            this.activeDeck.is_public = e.target.checked;
                        }
                    })
                ]),
            ]),
            content,
            m("br"),
            m(".buttons", [
                button("New Card", this.addNewCard, "primary")
            ]),
            m("br")
        ];
    }
}

export let Edit = new EditView();