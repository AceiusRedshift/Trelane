import m from "mithril";
import { button, isValidDeck, shuffle } from "./utils";
import { Storage } from "./storage";
import { EDITOR_PATH, LEARN_PATH, REVIEW_PATH, SPLASH_PATH } from "./constants";
import { InnerDeck } from "./innerDeck";

let cardNumber = 0;
let score = 0;
let totalAnswered = 0;
let quizCompleted = false;
let startTime = Date.now();
let deck: InnerDeck | null;

function resetValues() {
    cardNumber = 0;
    score = 0;
    totalAnswered = 0;
    quizCompleted = false;
    startTime = Date.now();

    if (Storage.activeDeck != null) {
        deck = Storage.activeDeck.inner_deck;
        shuffle(deck.cards);
    } else {
        deck = null;
    }
}

export let Learn = {
    oninit: () => {
        resetValues();
    },
    view: () => {
        if (quizCompleted) {
            return [
                m(".heading", [
                    m("h1.title", "Quiz Completed!"),
                    m("h2.subtitle", "Great job :D"),
                ]),
                m("p", `Your score was ${score}/${totalAnswered}.`),
                m("p", `Time taken: ${Math.floor((Date.now() - startTime) / 1000)} seconds.`),
                m(".buttons", [
                    button("Learn Again", () => {
                        m.route.set(LEARN_PATH);
                    }, "primary"),
                    button("Switch to Review", () => {
                        m.route.set(REVIEW_PATH);
                    }),
                    button("Back", () => m.route.set(EDITOR_PATH))
                ]),
            ];
        }

        if (deck == null || !isValidDeck(deck)) {
            resetValues();
        }

        if (deck == null || !isValidDeck(deck)) {
            return [
                m("p", "No deck loaded."),
                button("Back", () => m.route.set(SPLASH_PATH))
            ]
        }

        if (deck.cards.length < 4) {
            return [
                m("p", `Not enough cards in deck. Add ${4 - deck.cards.length} more.`),
                button("Back", () => m.route.set(EDITOR_PATH))
            ]
        }

        let card = deck.cards[cardNumber];
        let backText = card.back === "" ? "No back text... :c" : card.back;

        let answers = [card.front];
        let usedIndices = new Set([cardNumber]);

        while (answers.length < 4) {
            let randomIndex = Math.floor(Math.random() * deck.cards.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                answers.push(deck.cards[randomIndex].front);
            }
        }

        shuffle(answers);

        return [
            m(".card", m("h1.title", backText)),
            m("br"),
            m(".buttons", answers.map(answer =>
                button(answer, () => {
                    totalAnswered++;
                    if (answer === card.front) {
                        score++;
                    }
                    // @ts-ignore There is a null check above
                    if (cardNumber < deck.cards.length - 1) {
                        cardNumber++;
                    } else {
                        quizCompleted = true;
                    }
                })
            )),
            m("p", { style: "text-align: center;" }, `Question: ${cardNumber}/${deck.cards.length} | Score: ${score}/${totalAnswered}`)
        ]
    }
}