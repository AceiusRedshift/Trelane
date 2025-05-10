import {Deck} from "./deck";
import {
    STORAGE_DECK_KEY,
    STORAGE_MAIN_KEY,
    STORAGE_PASSWORD_KEY,
    STORAGE_SERVER_KEY,
    STORAGE_USERNAME_KEY
} from "./constants";
import {Toolbar} from "./toolbar";

/**
 * Handles saving data to local storage. For now, only one deck can be saved at a time.
 */
export const Storage = {
    /**
     * Set up local storage.
     */
    init: () => {
        console.log("Initializing storage.");

        let stored = localStorage.getItem(STORAGE_MAIN_KEY);

        if (stored == null || Array.isArray(stored)) {
            localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify([]));
        }

        if (!Storage.hasAccount()) {
            Toolbar.statusText = "";
        }

        if (Storage.getServerUrl() == null) {
            Storage.setServerUrl("http://localhost:5226");
        }
    },

    /**
     * Get all stored decks from local storage.
     * @returns {Deck[]} The stored decks.
     */
    getDecks: () => JSON.parse(localStorage.getItem(STORAGE_MAIN_KEY)),

    /**
     * Retrieve a deck from local storage.
     * @param {number} number The deck index to retrieve.
     */
    getDeck: (number) => {
        let deck = JSON.parse(localStorage.getItem(STORAGE_MAIN_KEY))[number];
        return new Deck(deck.name, deck.author, deck.cards);
    },

    /**
     * Save a deck object to local storage.
     * @param {number} number The deck index to overwrite.
     * @param {Deck} deck The deck object to save.
     */
    setDeck: (number, deck) => {
        let stored = JSON.parse(localStorage.getItem(STORAGE_MAIN_KEY));

        stored[number] = deck;

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
    },

    /**
     * Add a deck to local storage.
     * @param {Deck} deck The deck object to add.
     */
    addDeck: (deck) => {
        let stored = JSON.parse(localStorage.getItem(STORAGE_MAIN_KEY));

        stored.push(deck);

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
    },

    /**
     * Remove a deck from local storage.
     * @param {number} number The deck index to remove.
     */
    removeDeck: (number) => {
        let stored = JSON.parse(localStorage.getItem(STORAGE_MAIN_KEY));
        stored.splice(number, 1);
        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
    },

    /**
     * Check if a deck is saved in local storage.
     * @returns {boolean} True if a deck is saved, false otherwise.
     */
    hasActiveDeck: () => localStorage.getItem(STORAGE_DECK_KEY) != null,

    /**
     * Get the active deck from local storage.
     * @returns {Deck}
     */
    getActiveDeck: () => JSON.parse(localStorage.getItem(STORAGE_DECK_KEY)),

    /**
     * Set the active deck in local storage, and autosave.
     * @param {Deck} deck
     */
    setActiveDeck: (deck) => {
        localStorage.setItem(STORAGE_DECK_KEY, JSON.stringify(deck));

        let decks = Storage.getDecks();

        for (let i = 0; i < decks.length; i++) {
            if (decks[i].name === deck.name) {
                console.log("Autosaving deck " + deck.name + " to index " + i);
                Storage.setDeck(i, deck);
                return;
            }
        }

        // ok, if we havent returned by now we must add the deck
        Storage.addDeck(deck);
    },

    hasAccount: () => !(Storage.getUsername() == null || Storage.getUsername() === "") && !(Storage.getPassword() == null || Storage.getPassword() === ""),

    getUsername: () => localStorage.getItem(STORAGE_USERNAME_KEY),
    setUsername: (name) => localStorage.setItem(STORAGE_USERNAME_KEY, name),

    getPassword: () => localStorage.getItem(STORAGE_PASSWORD_KEY),
    setPassword: (password) => localStorage.setItem(STORAGE_PASSWORD_KEY, password),

    getServerUrl: () => localStorage.getItem(STORAGE_SERVER_KEY),
    setServerUrl: (url) => localStorage.setItem(STORAGE_SERVER_KEY, url),
}