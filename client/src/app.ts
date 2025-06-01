import { EDITOR_PATH, SPLASH_PATH, STORAGE_MAIN_KEY } from "./constants";
import { validateAccount } from "./utils";
import { Storage } from "./storage";
import { Toolbar } from "./toolbar";
import { Review } from "./review";
import { Splash } from "./splash";
import { Learn } from "./learn";
import { Edit } from "./edit";
import { Help } from "./help";
import m from "mithril";

export class App {
    private buildConsoleInterface() {
        // @ts-ignore
        window.trelane = {
            reset() {
                localStorage.setItem(STORAGE_MAIN_KEY, "");
                location.reload();
            }
        }
    }

    run(toolbarElement: Element, appElement: Element): void {
        if (Storage.hasCredentials()) {
            validateAccount();
        }

        this.buildConsoleInterface();

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