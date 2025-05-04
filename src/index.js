import m from "mithril";
import "../node_modules/@mielo-ui/mielo/css/mielo.css";

const root = document.getElementById("app");

let Splash = {
    view: () => m("a", {href: "#!/app"}, "Enter!")
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