import {Toolbar} from "./toolbar";
import {Network} from "./network";
import {isDarkMode} from "./utils";
import {Theme} from "./theme";
import {STORAGE_MAIN_KEY} from "./constants";
// @ts-ignore
import {version} from "../package.json";
import {Deck} from "./deck";

class StorageLayout {
    public readonly layout_version = version;

    public first_visit: boolean = true;
    public active_deck: Deck | null = null;
    public decks: Deck[] = [];

    public email: string = "";
    public password: string = "";

    public theme: Theme = Theme.System;
}

/**
 * Handles saving data to local storage. For now, only one deck can be saved at a time.
 */
export class Storage {
    private static read<T>(key: string): T {
        let rawValue = localStorage.getItem(key);
        if (!rawValue) {
            throw new Error(key + " is null.");
        }

        return <T>JSON.parse(rawValue);
    }

    private static exists<T>(key: string): boolean {
        return localStorage.getItem(key) != null;
    }

    private static write(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
        console.log("Writing to " + key);
    }

    private static get database() {
        return this.read<StorageLayout>(STORAGE_MAIN_KEY);
    }

    private static set database(value: StorageLayout) {
        this.write(STORAGE_MAIN_KEY, value);
    }

    /**
     * Set up local storage.
     */
    static init() {
        console.log("Initializing storage.");

        if (!this.exists(STORAGE_MAIN_KEY)) {
            console.info("Writing new database layout.");
            this.database = new StorageLayout();
        }

        if (version != this.database.layout_version) {
            console.warn(`Storage layout version is out of date.`);
        }
    }

    static get decks(): Deck[] {
        return this.database.decks;
    }

    static get activeDeck(): Deck | null {
        return this.database.active_deck;
    }

    /**
     * Set the active deck in local storage, and autosave.
     * @param {Deck} deck
     */
    static set activeDeck(deck: Deck) {
        this.database.active_deck = deck;

        let decks = this.database.decks;

        for (let i = 0; i < decks.length; i++) {
            if (decks[i].name === deck.name) {
                console.log("Autosaving deck " + deck.name + " to index " + i);

                this.database.decks[i] = deck;

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
        this.database.decks.push(deck);
    }

    static hasCredentials() {
        return !(this.database.email === "") && !(this.database.password === "");
    }

    static get email() {
        return this.database.email;
    }
    static set email(name: string) {
        this.database.email = name;
    }

    static get password(): string {
        return this.database.password;
    }
    static set password(password: string) {
        this.database.password = password;
    }

    static get userTheme() {
        return this.database.theme;
    }

    static set userTheme(theme: Theme) {
        this.database.theme = theme;
    }

    static getActiveTheme() {
        let userTheme = this.userTheme;

        if (userTheme == Theme.System) {
            return isDarkMode() ? Theme.Dark : Theme.Light;
        }

        return userTheme;
    }

    static isFirstVisit() {
        return this.database.first_visit;
    }

    static confirmVisit() {
        this.database.first_visit = true;
    }

    static dump() {
        console.log("Dumping storage");
        console.log(this.database);
    }
}