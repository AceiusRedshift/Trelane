import {Deck} from "./deck";

const KEY = "trelane-deck";

/**
 * Manages saving data to local storage. For now, only one deck can be saved at a time.
 * @type {{deckSaved: (function(): boolean), getDeck: (function(): Deck), setDeck: (function(*): void)}}
 */
export const Saver = {
    /**
     * Checks if a deck is saved in local storage.
     * @returns {boolean} True when there is a deck present.
     */
    deckSaved: () => localStorage.getItem(KEY) != null,
    /**
     * Retrieve a deck from local storage.
     */
    getDeck: () => {
        let deck = JSON.parse(localStorage.getItem(KEY));
        return new Deck(deck.name, deck.author, deck.cards);
    },
    /**
     * Save a deck object to local storage.
     * @param deck The deck object to save.
     */
    setDeck: (deck) => localStorage.setItem(KEY, JSON.stringify(deck))
}