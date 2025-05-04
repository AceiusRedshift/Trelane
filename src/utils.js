import m from "mithril";

export function isNull(obj) {
    return !isNotNull(obj);
}

export function isNotNull(obj) {
    return obj != null;
}

export const button = (text, onclick, css = "") => m(
    "button",
    {
        className: css,
        onclick: onclick
    },
    text
);

export function bailToSplashIfDeckIsNull(){
    let deck = window.CurrentDeck;

    if (isNull(deck)) {
        m.route.set(SPLASH_PATH);
        return;
    }

    if (!deck || !Array.isArray(deck.cards)) {
        console.error('Invalid deck structure');
        m.route.set(SPLASH_PATH);
        return;
    }
}