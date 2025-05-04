import m from "mithril";

export const button = (text, onclick, css = "") => m(
    "button",
    {
        className: css,
        onclick: onclick
    },
    text
);