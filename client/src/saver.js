import {Deck} from "./deck";
import {STORAGE_KEY} from "./constants";

/**
 * Handles saving data to local storage. For now, only one deck can be saved at a time.
 * @type {{isDeckSaved: (function(): boolean), getDeck: (function(): Deck), setDeck: (function(*): void)}}
 */
export const Saver = {
    /**
     * Checks if a deck is saved in local storage.
     * @returns {boolean} True when there is a deck present.
     */
    isDeckSaved: () => localStorage.getItem(STORAGE_KEY) != null,
    /**
     * Retrieve a deck from local storage.
     */
    getDeck: () => {
        let deck = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return new Deck(deck.name, deck.author, deck.cards);
    },
    /**
     * Save a deck object to local storage.
     * @param deck The deck object to save.
     */
    setDeck: (deck) => localStorage.setItem(STORAGE_KEY, JSON.stringify(deck))
}