import {Toolbar} from "./toolbar";
import {Network} from "./network";
import {isDarkMode} from "./utils";
import {Theme} from "./theme";
import {STORAGE_MAIN_KEY} from "./constants";
// @ts-ignore
import {version} from "../package.json";
import {Deck} from "./deck";

export class StorageData {
    public readonly layout_version = version;

    public first_visit: boolean = true;
    private active_deck: Deck | null = null;
    public decks: Deck[] = [];

    public email: string = "";
    public password: string = "";

    public theme: Theme = Theme.System;

    /**
     * Set up local storage.
     */
    constructor() {
        console.log("Initializing storage.");

        if (version != this.layout_version) {
            console.warn(`Storage layout version is out of date.`);
        }
    }

    get activeDeck(): Deck | null {
        return this.active_deck;
    }

    /**
     * Set the active deck in local storage, and autosave.
     * @param {Deck} deck
     */
    set activeDeck(deck: Deck) {
        this.active_deck = deck;

        let decks = this.decks;

        for (let i = 0; i < decks.length; i++) {
            if (decks[i].name === deck.name) {
                console.log("Autosaving deck " + deck.name + " to index " + i);

                this.decks[i] = deck;

                if (!deck.local) {
                    if (!this.hasCredentials()) {
                        Toolbar.statusText = "No account - Saved locally at " + new Date().toLocaleTimeString();
                        return;
                    }

                    Toolbar.statusText = "Saving to cloud...";

                    Network.addOrUpdateDeck(deck).then((response) => {
                        Toolbar.statusText = "Saved to cloud at " + new Date().toLocaleTimeString();
                        console.log(Toolbar.statusText)
                    });
                } else {
                    Toolbar.statusText = "Saved at " + new Date().toLocaleTimeString();
                }

                return;
            }
        }

        // ok, if we have not returned by now we must add the deck
        this.decks.push(deck);
    }

    hasCredentials() {
        return !(this.email === "") && !(this.password === "");
    }

    get userTheme() {
        return this.theme;
    }

    set userTheme(theme: Theme) {
        this.theme = theme;
    }

    getActiveTheme() {
        let userTheme = this.userTheme;

        if (userTheme == Theme.System) {
            return isDarkMode() ? Theme.Dark : Theme.Light;
        }

        return userTheme;
    }

    dump() {
        console.log("Dumping storage");
        console.log(this);
    }
}

function loadStorage(): StorageData {
    const raw = localStorage.getItem(STORAGE_MAIN_KEY);

    if (!raw) return new StorageData();

    try {
        const data = JSON.parse(raw);
        const instance = new StorageData();
        Object.assign(instance, data); // Ensures prototype chain is preserved (thanks chat)
        return instance;
    } catch (e) {
        console.error("Storage load error:", e);
        return new StorageData();
    }
}

export const Storage = loadStorage();
setInterval(() => localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(Storage)), 1000);