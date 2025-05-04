import m from "mithril";
import "../node_modules/@mielo-ui/mielo/css/mielo.css";

const ROOT = document.getElementById("app");
const SPLASH_PATH = "/splash";
const EDITOR_PATH = "/edit"

/* Utility functions */
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
    makeDeck: () => m.route.set(EDITOR_PATH),
    loadDeck: () => m.route.set(EDITOR_PATH),
    view: () => [
        m("div", {className: "mie header large center"}, [
            m(".heading", [
                m(".title", "Trelane"),
                m(".subtitle", "A semi-competent SRS"),
            ]),
        ]),
        m("div", {className: "mie view p-massive"},
            m("div", {className: "mie buttons"}, [
                button("New Deck", Splash.makeDeck),
                button("Load Deck", Splash.loadDeck, "accent")
            ])
        )
    ]
}

let Edit = {
    view: () => m("p", "Card Screen")
}

try {
    let routes = {};
    routes[`${SPLASH_PATH}`] = Splash;
    routes[`${EDITOR_PATH}`] = Edit;

    m.route(ROOT, SPLASH_PATH, routes);
} catch (e) {
    m.render(ROOT, m("p", e.toString()));
    throw e;
}