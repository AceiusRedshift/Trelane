import { EDITOR_PATH } from "./constants";
import m from "mithril";

function convertDeckToCsv(deck) {
    let string = "";

    deck.cards.forEach(card => string += `${card.front}, ${card.back}\n`);

    return string;
}

function convertDeckToLogseq(deck) {
    let string = `- # ${deck.name}\n- **Author:** ${deck.author}\n`;

    deck.cards.forEach(card => string += `- ${card.front} #card\n	- ${card.back}\n`);

    return string;
}

export let Export = {
    view: () => {
        return [
            m(".heading", [
                m("h1.title", "Export"),
                // m("h2.subtitle", "A semi-competent help guide."),
            ]),
            m(".buttons", [
                button("Back", () => {
                    m.route.set(EDITOR_PATH);
                })
            ])
        ]
    }
}