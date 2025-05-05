import m from "mithril";
import {button} from "./utils";

export let Help = {
    view: () => [
        m(".heading", [
            m("h1.title", "Help"),
            m("h2.subtitle", "A semi-competent help guide."),
        ]),
        m("p", "Trelane is a semi-competent memorization tool. It is designed to help you learn new terms and concepts."),
        m("p", "It is intended to be used as a drop-in replacement for Quizlet, and it's design is also partly informed by the quiz format used at my school."),
        m("p", "I recommend you use it with the following workflow:"),
        m("ol", [
            m("li", "Create or import a new deck."),
            m("li", "First, use Learn mode to acquaint yourself with the terms."),
            m("li", "Then, Review mode to review the terms."),
            m("li", "Finally, use Test mode to see how well you know the content."),
        ]),
        m(".buttons", [
            button("Back", () => {
                m.route.set(SPLASH_PATH);
            })
        ])
    ]
}