import m from "mithril";
import {button} from "./button";
import {Card} from "./card";

export let Edit = {
    view: () => {
        if (CurrentDeck === null) {
            console.log("Deck is unloaded, cannot edit unloaded deck.")
            m.route.set(SPLASH_PATH);
        }

        let buttons = [
            button("New Card", () => {CurrentDeck.cards.push(new Card(prompt("Card Front"), prompt("Card Back")))}, "primary")
        ];

        if (CurrentDeck.cards.length === 0) {
            return [
                m("p", "No cards in deck."),
                buttons
            ];
        }

        return [
            m(".user-list", CurrentDeck.cards.map(card => m(".user-list-item", card.front + " " + card.back))),
            buttons
        ]
    }
}