import {Deck} from "./deck";
import {
    STORAGE_DECK_KEY, STORAGE_ENABLE_CLOUD_KEY,
    STORAGE_MAIN_KEY, STORAGE_META_KEY,
    STORAGE_PASSWORD_KEY,
    STORAGE_SERVER_KEY, STORAGE_THEME_KEY,
    STORAGE_EMAIL_KEY
} from "./constants";
import {Toolbar} from "./toolbar";
import {DeckMeta} from "./deckmeta";
import {Network} from "./network";
import {isDarkMode} from "./utils";
import {Theme} from "./theme";

/**
 * Handles saving data to local storage. For now, only one deck can be saved at a time.
 */
export const Storage = {
    /**
     * Set up local storage.
     */
    init: () => {
        console.log("Initializing storage.");

        let storedDecks = localStorage.getItem(STORAGE_MAIN_KEY);
        if (storedDecks == null || Array.isArray(storedDecks)) {
            localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify([]));
        }

        let storedMeta = localStorage.getItem(STORAGE_META_KEY);
        if (storedMeta == null || Array.isArray(storedMeta)) {
            localStorage.setItem(STORAGE_META_KEY, JSON.stringify([]));
        }

        if (localStorage.getItem(STORAGE_THEME_KEY) == null) {
            Storage.setUserTheme(Theme.System);
        }
    },

    /**
     * Get all stored decks from local storage.
     * @returns {Deck[]} The stored decks.
     */
    getDecks(): Deck[] {
        return JSON.parse(<string>localStorage.getItem(STORAGE_MAIN_KEY));
    },

    /**
     * Retrieve a deck from local storage.
     * @param {number} deckNumber The deck index to retrieve.
     */
    getDeck(deckNumber: number) {
        return this.getDecks()[deckNumber];
    },

    /**
     * Retrieve the metadata of a deck from local storage.
     * @param {number} deckNumber The deck index to retrieve metadata for.
     * @returns {DeckMeta} The metadata of the deck.
     */
    getMeta(deckNumber: number): DeckMeta {
        let metas = localStorage.getItem(STORAGE_META_KEY);

        if (metas == null) {
            throw new Error("Local storage deck metadata was null");
        } else {
            return JSON.parse(metas)[deckNumber];
        }
    },

    /**
     * Update the metadata of a deck.
     * @param {number} deckNumber The deck index to update.
     * @param {DeckMeta} metaData The metadata to apply.
     */
    setMeta: (deckNumber: number, metaData: DeckMeta) => {
        let metas = localStorage.getItem(STORAGE_META_KEY);

        if (metas == null) {
            throw new Error("Local storage deck metadata was null");
        }

        let meta = JSON.parse(metas);

        meta[deckNumber] = metaData;

        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    },

    /**
     * Save a deck object to local storage.
     * @param {number} number The deck index to overwrite.
     * @param {Deck} deck The deck object to save.
     */
    setDeck: (number: number, deck: Deck) => {
        let stored = JSON.parse(<string>localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY));

        stored[number] = deck;
        meta[number].updated = Date.now();

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    },

    /**
     * Add a deck to local storage.
     * @param {Deck} deck The deck object to add.
     */
    addDeck: (deck: Deck) => {
        let stored = JSON.parse(<string>localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY));

        let dm = new DeckMeta(false, false, Date.now(), Date.now());

        stored.push(deck);
        meta.push(dm);

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    },

    /**
     * Remove a deck from local storage.
     * @param {number} number The deck index to remove.
     */
    removeDeck: (number: number) => {
        let stored = JSON.parse(<string>localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY));

        stored.splice(number, 1);
        meta.splice(number, 1);

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    },

    /**
     * Check if a deck is saved in local storage.
     * @returns {boolean} True if a deck is saved, false otherwise.
     */
    hasActiveDeck: (): boolean => localStorage.getItem(STORAGE_DECK_KEY) != null,

    /**
     * Get the active deck from local storage.
     * @returns {Deck}
     */
    getActiveDeck: (): Deck => JSON.parse(<string>localStorage.getItem(STORAGE_DECK_KEY)),

    /**
     * Set the active deck in local storage, and autosave.
     * @param {Deck} deck
     */
    setActiveDeck: (deck: Deck) => {
        localStorage.setItem(STORAGE_DECK_KEY, JSON.stringify(deck));

        let decks = Storage.getDecks();

        for (let i = 0; i < decks.length; i++) {
            if (decks[i].name === deck.name) {
                console.log("Autosaving deck " + deck.name + " to index " + i);

                Storage.setDeck(i, deck);

                let willSync = Storage.getMeta(i).sync;

                if (willSync) {
                    if (!Storage.hasAccount()) {
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
    },

    /**
     * Get the active deck metadata from local storage.
     * @returns {DeckMeta}
     */
    getActiveDeckMeta: (): DeckMeta => {
        let decks = Storage.getDecks();
        let activeDeck = Storage.getActiveDeck();
        let meta = JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY));

        for (let i = 0; i < decks.length; i++) {
            if (decks[i].name === activeDeck.name) {
                return meta[i];
            }
        }

        throw new Error(`Active deck ${activeDeck.name} not in decks`);
    },

    /**
     * Set the active deck metadata in local storage.
     * @param {DeckMeta} meta
     */
    setActiveDeckMeta: (meta: DeckMeta) => {
        let decks = Storage.getDecks();
        let activeDeck = Storage.getActiveDeck();
        let storedMeta = JSON.parse(<string>localStorage.getItem(STORAGE_META_KEY));

        for (let i = 0; i < decks.length; i++) {
            if (decks[i].name === activeDeck.name) {
                storedMeta[i] = meta;
                localStorage.setItem(STORAGE_META_KEY, JSON.stringify(storedMeta));
                return;
            }
        }
    },


    hasAccount: () => Storage.getCloudFeaturesEnabled() && !(Storage.getEmail() == null || Storage.getEmail() === "") && !(Storage.getPassword() == null || Storage.getPassword() === ""),

    getEmail() {
        return <string>localStorage.getItem(STORAGE_EMAIL_KEY)
    },
    setEmail(name: string) {
        localStorage.setItem(STORAGE_EMAIL_KEY, name)
    },

    getPassword(): string {
        return <string>localStorage.getItem(STORAGE_PASSWORD_KEY);
    },
    setPassword: (password: string) => localStorage.setItem(STORAGE_PASSWORD_KEY, password),

    dump() {
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
    },

    getCloudFeaturesEnabled() {
        return localStorage.getItem(STORAGE_ENABLE_CLOUD_KEY) === "yes";
    },
    setCloudFeaturesEnabled(enabled: boolean) {
        localStorage.setItem(STORAGE_ENABLE_CLOUD_KEY, enabled ? "yes" : "no");
    },

    getUserTheme() {
        return <Theme>JSON.parse(<string>localStorage.getItem(STORAGE_THEME_KEY));
    },
    setUserTheme(theme: Theme) {
        localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(theme));
    },
    getActiveTheme() {
        let userTheme = this.getUserTheme();

        if (userTheme == Theme.System) {
            return isDarkMode() ? Theme.Dark : Theme.Light;
        }

        return userTheme;
    }
}