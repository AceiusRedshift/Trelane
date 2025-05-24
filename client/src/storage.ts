import {InnerDeck} from "./innerDeck";
import {Toolbar} from "./toolbar";
import {Network} from "./network";
import {isDarkMode} from "./utils";
import {Theme} from "./theme";
import {
    STORAGE_DECK_KEY,
    STORAGE_MAIN_KEY,
    STORAGE_META_KEY,
    STORAGE_PASSWORD_KEY,
    STORAGE_THEME_KEY,
    STORAGE_EMAIL_KEY
} from "./constants";

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

    private static write(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Set up local storage.
     */
    static init() {
        console.log("Initializing storage.");

        let storedDecks = this.read(STORAGE_MAIN_KEY);
        if (storedDecks == null || Array.isArray(storedDecks)) {
            this.write(STORAGE_MAIN_KEY, JSON.stringify([]));
        }

        let storedMeta = localStorage.getItem(STORAGE_META_KEY);
        if (storedMeta == null || Array.isArray(storedMeta)) {
            localStorage.setItem(STORAGE_META_KEY, JSON.stringify([]));
        }

        if (localStorage.getItem(STORAGE_THEME_KEY) == null) {
            Storage.setUserTheme(Theme.System);
        }
    }

    /**
     * Get all stored decks from local storage.
     * @returns {InnerDeck[]} The stored decks.
     */
    static getDecks(): InnerDeck[] {
        return JSON.parse(<string>localStorage.getItem(STORAGE_MAIN_KEY));
    }

    /**
     * Retrieve a deck from local storage.
     * @param {number} deckNumber The deck index to retrieve.
     */
    static getDeck(deckNumber: number) {
        return this.getDecks()[deckNumber];
    }

    /**
     * Save a deck object to local storage.
     * @param {number} number The deck index to overwrite.
     * @param {InnerDeck} deck The deck object to save.
     */
    static setDeck(number: number, deck: InnerDeck) {
        let stored = JSON.parse(<string>localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY));

        stored[number] = deck;
        meta[number].updated = Date.now();

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    }

    /**
     * Add a deck to local storage.
     * @param {InnerDeck} deck The deck object to add.
     */
    static addDecl    (deck: InnerDeck) {
        let stored = JSON.parse(<string>localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY));

        let dm = new DeckMeta(false, false, Date.now(), Date.now());

        stored.push(deck);
        meta.push(dm);

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    }

    /**
     * Remove a deck from local storage.
     * @param {number} number The deck index to remove.
     */
    static removeDeck(number: number) {
        let stored = JSON.parse(<string>localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY));

        stored.splice(number, 1);
        meta.splice(number, 1);

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    }

    /**
     * Check if a deck is saved in local storage.
     * @returns {boolean} True if a deck is saved, false otherwise.
     */
    static hasActiveDeck(): boolean {
        return localStorage.getItem(STORAGE_DECK_KEY) != null;
    }

    /**
     * Get the active deck from local storage.
     * @returns {InnerDeck}
     */
    static getActiveDeck(): InnerDeck {
        return JSON.parse(<string>localStorage.getItem(STORAGE_DECK_KEY));
    }

    /**
     * Set the active deck in local storage, and autosave.
     * @param {InnerDeck} deck
     */
    static setActiveDeck(deck: InnerDeck) {
        localStorage.setItem(STORAGE_DECK_KEY, JSON.stringify(deck));

        let decks = Storage.getDecks();

        for (let i = 0; i < decks.length; i++) {
            if (decks[i].name === deck.name) {
                console.log("Autosaving deck " + deck.name + " to index " + i);

                Storage.setDeck(i, deck);

                let willSync = Storage.getMeta(i).sync;

                if (willSync) {
                    if (!Storage.hasCredentials()) {
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
        Storage.addDeck(deck);
    }

    static hasCredentials() {
        return !(Storage.getEmail() == null || Storage.getEmail() === "") && !(Storage.getPassword() == null || Storage.getPassword() === "");
    }

    static getEmail() {
        return <string>localStorage.getItem(STORAGE_EMAIL_KEY)
    }

    static setEmail(name: string) {
        localStorage.setItem(STORAGE_EMAIL_KEY, name)
    }

    static getPassword(): string {
        return <string>localStorage.getItem(STORAGE_PASSWORD_KEY);
    }

    static setPassword(password: string) {
        return localStorage.setItem(STORAGE_PASSWORD_KEY, password);
    }

    static dump() {
        console.log("Dumping storage");

        let decks = this.getDecks();

        if (decks.length === 0) {
            console.log("No decks to dump");
        }

        for (let i = 0; i < decks.length; i++) {
            console.log(`${i}. ${decks[i].name}`);
            console.log(decks[i]);
            console.log(JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY))[i]);
        }
    }

    static getUserTheme() {
        return <Theme>JSON.parse(<string>localStorage.getItem(STORAGE_THEME_KEY));
    }

    static setUserTheme(theme: Theme) {
        localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(theme));
    }

    static getActiveTheme() {
        let userTheme = this.getUserTheme();

        if (userTheme == Theme.System) {
            return isDarkMode() ? Theme.Dark : Theme.Light;
        }

        return userTheme;
    }

    static isFirstVisit() {
        return localStorage.getItem("VISITED_BEFORE") !== "yes";
    }

    static confirmVisit() {
        localStorage.setItem("VISITED_BEFORE", "yes");
    }
}