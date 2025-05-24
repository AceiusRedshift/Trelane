import m from "mithril";
import {App} from "./app.js";

try {
    let app = new App();

    app.run(document.getElementById("toolbar"), document.getElementById("app"));
} catch (e) {
    m.render(document.body, m("p", `Error: ${e}`));
    throw e;
}