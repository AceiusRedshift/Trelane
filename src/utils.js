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