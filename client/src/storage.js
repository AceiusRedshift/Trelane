import {Deck} from "./deck";
import {STORAGE_DECK_KEY, STORAGE_MAIN_KEY} from "./constants";

/**
 * Handles saving data to local storage. For now, only one deck can be saved at a time.
 * @type {{decks: *[], init: Storage.init, getDeck: (function(number): Deck), setDeck: Storage.setDeck, addDeck: Storage.addDeck, hasActiveDeck: (function(): boolean), getActiveDeck: (function(): any), setActiveDeck: (function(Deck): void)}}
 */
export const Storage = {
    decks: [],

    /**
     * Set up local storage.
     */
    init: () => {
        let stored = localStorage.getItem(STORAGE_MAIN_KEY);

        if (stored == null || Array.isArray(stored)) {
            console.log("Initializing storage.")
            localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify([]));
        }
    },

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
     * Set the active deck in local storage.
     * @param {Deck} deck
     */
    setActiveDeck: (deck) => localStorage.setItem(STORAGE_DECK_KEY, JSON.stringify(deck)),
}