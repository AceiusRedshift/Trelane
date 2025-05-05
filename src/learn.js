import m from "mithril";
import { button } from "./utils";
import { Saver } from "./saver";

let cardNumber = 0;
let showAnswer = false;

export let Learn = {
    reset: () => cardNumber = 0,
    view: () => {
        let deck;

        if (Saver.isDeckSaved()) {
            deck = Saver.getDeck();
        } else {
            m.route.set(SPLASH_PATH);
            return;
        }

        if (deck.cards.length < 4) {
            return [
                m("p", `Not enough cards in deck. Add ${4 - deck.cards.length} more.`),
                button("Back", () => m.route.set(EDITOR_PATH))
            ]
        }

        let card = deck.cards[cardNumber];
        let frontText = card.front === "" ? "No front text... :c" : card.front;
        let backText = card.back === "" ? "No back text... :c" : card.back;

        let answerButtons = [];
        for (let index = 0; index < 4; index++) {
            const element = array[index];
            
        }

        return [
            m(".card", m("h1.title", frontText)),
            m("br"),
            m(".buttons", [

            ])
        ]
    }
}