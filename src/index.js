import m from "mithril";
import "../node_modules/@mielo-ui/mielo/css/mielo.css";

const root = document.getElementById("app");

function button(text, onclick, css) {
    return m(
        "button",
        {
            className: "mie button pilled " + css,
            onclick: onclick
        },
        text
    );
}

let Splash = {
    view: () => [
        m("div", {className: "mie header large center"}, [
            m("div", {className: "heading"}, [
                m("div", {className: "title"}, "Trelane"),
                m("div", {className: "subtitle"}, "A semi-competent SRS"),
            ]),
        ]),
        m("div", {className: "mie buttons"}, [
            button("New Deck", () => m.route.set("/app")),
            button("Load Deck", () => m.route.set("/app"), "accent")
        ])
    ]
}

let App = {
    view: () => m("p", "screen2")
}

try {
    m.route(root, "/splash", {
        "/splash": Splash,
        "/app": App
    });
} catch (e) {
    m.render(root, m("p", e.toString()));
    throw e;
}