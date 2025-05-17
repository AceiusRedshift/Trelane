import m from "mithril";
import { button } from "./utils";
import { Storage } from "./storage";
import {EDITOR_PATH, SPLASH_PATH} from "./constants";

let cardNumber = 0;
let showAnswer = false;

export let Review = {
    oninit: () => cardNumber = 0,
    view: () => {
        let deck;

        if (Storage.hasActiveDeck()) {
            deck = Storage.getActiveDeck();
        } else {
            m.route.set(SPLASH_PATH);
            return;
        }

        let frontText = "No cards to review... :c";
        if (deck.cards.length > 0) {
            let card = deck.cards[cardNumber];
            frontText = card.front === "" ? "No front text... :c" : card.front;
        }

        let backText = "Come on, go add some!";
        if (deck.cards.length > 0) {
            let card = deck.cards[cardNumber];
            backText = card.back === "" ? "No back text... :c" : card.back;
        }

        let content = [m("h1.title", frontText)];
        if (showAnswer) {
            content.push(m("h2.subtitle", backText))
        }

        let backButton = button("Back", () => {
            showAnswer = false;
            cardNumber = Math.max(0, cardNumber - 1);
        });
        let editorButton = button("Back", () => m.route.set(EDITOR_PATH));

        let nextButton = button("Next", () => {
            showAnswer = false;
            cardNumber = Math.min(deck.cards.length - 1, cardNumber + 1);
        });
        let finishButton = button("Finish", () => m.route.set(EDITOR_PATH), "primary");

        return [
            m(".card", { onclick: () => showAnswer = !showAnswer }, content),
            m("br"),
            m(".buttons", [
                cardNumber === 0 ? editorButton : backButton,
                button(cardNumber + 1 + "/" + deck.cards.length, () => {
                }, "none"),
                cardNumber === deck.cards.length - 1 ? finishButton : nextButton
            ])
        ]
    }
}