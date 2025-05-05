import m from "mithril";
import {Deck} from "./deck";
import {Card} from "./card";
import {Saver} from "./saver";
import {button} from "./utils";

export let Splash = {
    view: () => [
        m(".heading", [
            m("h1.title", "Trelane"),
            m("h2.subtitle", "A semi-competent memorization tool."),
        ]),
        m(".buttons", [
            Saver.isDeckSaved() ? button("Continue Editing", () => m.route.set(EDITOR_PATH), "primary") : [],
            button("New Deck", () => {
                Saver.setDeck(
                    new Deck(
                        prompt("What would you like to name the deck?", "New Deck"),
                        prompt("What is your name?", "User"),
                        [
                            new Card("", "")
                        ]
                    )
                );
                m.route.set(EDITOR_PATH);
            }, Saver.isDeckSaved() ? "" : "primary"),
            button("Load Deck", () => m.route.set(LOADER_PATH)),
            button("Help", () => m.route.set(HELP_PATH))
        ])
    ]
}