import m from "mithril";
import { button } from "./utils";
import { SPLASH_PATH } from "./constants";

export let Help = {
    view: () => [
        m(".heading", [
            m("h1.title", "Help"),
        ]),
        m("p", "Trelane is a memorization tool, designed to help you learn new terms and concepts."),
        m("h2.subtitle", "Authoring Decks"),
        m("p", "To begin, either press File > New to create a new deck, or File > Open to import a deck from a file."),
        m("p", "You can click on the name of the deck, as well as your name to change them. Note that if you have sync enabled, and have set the deck to public your account email will appear here instead."),
        m("h2.subtitle", "Studying Decks"),
        m("p",
            `To study your deck, you can either use Deck > Learn (Quiz) or Deck > Review (Flashcards). 
            Learn mode requires at least 4 cards in the deck, and is essentially a multi-choice quiz.
            Review mode is basically the same as reviewing flash cards normally, terms are presented to you, and you can click to reveal the definition.`
        ),
        m("h2.subtitle", "Sharing Decks"),
        m("p",
            `You can sign up for a Trelane account (or sign into one) by going to File > Settings > Account Switcher.
            Once you have signed up for an account, you can share decks by ticking the publish box in the editor.
            You may also share decks by exporting them to a file and distributing that file. Current supported formats are Trelane JSON, Generic 1CSV, and Logseq pages.`
        ),
        m(".buttons", [
            button("Back", () => {
                m.route.set(SPLASH_PATH);
            })
        ])
    ]
}