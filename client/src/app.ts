import {Storage} from "./storage";
import {validateAccount} from "./utils";
import {EDITOR_PATH, SPLASH_PATH} from "./constants";
import {Splash} from "./splash";
import {Edit} from "./edit";
import {Review} from "./review";
import {Learn} from "./learn";
import {Help} from "./help";
import {Toolbar} from "./toolbar";
import m from "mithril";

export class App {
    run(toolbarElement: Element, appElement: Element): void {
        Storage.init();

        if (Storage.hasCredentials()) {
            validateAccount();
        }

        document.body.setAttribute("data-theme", Storage.getActiveTheme().toString().toLowerCase());

        m.mount(toolbarElement, Toolbar);
        m.route(appElement, Storage.activeDeck != null ? EDITOR_PATH : SPLASH_PATH, {
            "/splash": Splash,
            "/edit": Edit,
            "/help": Help,
            "/view": Review,
            "/learn": Learn,
        });
    }
}