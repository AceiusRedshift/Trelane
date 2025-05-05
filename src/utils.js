import m from "mithril";

export const button = (text, onclick, css = "") => m(
    "button",
    {
        className: css,
        onclick: onclick
    },
    text
);

export const isString = (value) => typeof value === 'string' || value instanceof String;

export const isValidDeck = (deck) => isString(deck.name) && isString(deck.author) && Array.isArray(deck.cards);

export const download = (content, fileName, contentType) => {
    let a = document.createElement("a");

    a.href = URL.createObjectURL(new Blob([content], {type: contentType}));
    a.download = fileName;
    a.click();
}