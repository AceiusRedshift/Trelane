import {Deck} from "./deck";
import {
    STORAGE_DECK_KEY,
    STORAGE_MAIN_KEY, STORAGE_META_KEY,
    STORAGE_PASSWORD_KEY,
    STORAGE_SERVER_KEY,
    STORAGE_USERNAME_KEY
} from "./constants";
import {Toolbar} from "./toolbar";
import {DeckMeta} from "./deckmeta";
import m from "mithril";

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
     * Retrieve the metadata of a deck from local storage.
     * @param {number} number The deck index to retrieve metadata for.
     * @returns {DeckMeta} The metadata of the deck.
     */
    getMeta: (number) => {
        let meta = JSON.parse(localStorage.getItem(STORAGE_META_KEY))[number];
        return new DeckMeta(meta.sync, meta.isPublic, meta.created, meta.updated);
    },

    /**
     * Update the metadata of a deck.
     * @param {number} number The deck index to update.
     * @param {DeckMeta} metaData The metadata to apply.
     */
    setMeta: (number, metaData) => {
        let meta = JSON.parse(localStorage.getItem(STORAGE_META_KEY));

        meta[number] = metaData;

        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    },

    /**
     * Save a deck object to local storage.
     * @param {number} number The deck index to overwrite.
     * @param {Deck} deck The deck object to save.
     */
    setDeck: (number, deck) => {
        let stored = JSON.parse(localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(localStorage.getItem(STORAGE_META_KEY));

        stored[number] = deck;
        meta[number].updated = Date.now();

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    },

    /**
     * Add a deck to local storage.
     * @param {Deck} deck The deck object to add.
     */
    addDeck: (deck) => {
        let stored = JSON.parse(localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(localStorage.getItem(STORAGE_META_KEY));

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
    removeDeck: (number) => {
        let stored = JSON.parse(localStorage.getItem(STORAGE_MAIN_KEY));
        let meta = JSON.parse(localStorage.getItem(STORAGE_META_KEY));

        stored.splice(number, 1);
        meta.splice(number, 1);

        localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(stored));
        localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
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
                
                let willSync = Storage.getMeta(i).sync;
                
                if (willSync) {
                    if (!Storage.hasAccount()) {
                        Toolbar.statusText = "No account - Saved locally at " + new Date().toLocaleTimeString();
                        return;
                    }
                    
                    Toolbar.statusText = "Saving to cloud...";
                    
                    m.request({
                        method: "POST",
                        url: `${Storage.getServerUrl()}/set-deck`,
                        body: {
                            username: Storage.getUsername(),
                            password: Storage.getPassword(),
                            deck: deck,
                        },
                        timeout: 5000,
                        withCredentials: true
                    }).then((response) => {
                        Toolbar.statusText = "Saved to cloud at " + new Date().toLocaleTimeString();
                        console.log(Toolbar.statusText)
                    }).catch((error) => {
                        Toolbar.statusText = "Error: " + error.message;

                        if (error.message === "Request timed out") {
                            Toolbar.statusText = (navigator.onLine ? "Server" : "You're") + " offline - Saved locally at " + new Date().toLocaleTimeString();
                        }
                    });
                } else {
                    Toolbar.statusText = "Saved at " + new Date().toLocaleTimeString();
                }
                
                return;
            }
        }

        // ok, if we havent returned by now we must add the deck
        Storage.addDeck(deck);
    },

    /**
     * Get the active deck metadata from local storage.
     * @returns {DeckMeta}
     */
    getActiveDeckMeta: () => {
        let decks = Storage.getDecks();
        let activeDeck = Storage.getActiveDeck();
        let meta = JSON.parse(localStorage.getItem(STORAGE_META_KEY));

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
    setActiveDeckMeta: (meta) => {
        let decks = Storage.getDecks();
        let activeDeck = Storage.getActiveDeck();
        let storedMeta = JSON.parse(localStorage.getItem(STORAGE_META_KEY));

        for (let i = 0; i < decks.length; i++) {
            if (decks[i].name === activeDeck.name) {
                storedMeta[i] = meta;
                localStorage.setItem(STORAGE_META_KEY, JSON.stringify(storedMeta));
                return;
            }
        }
    },


    hasAccount: () => !(Storage.getUsername() == null || Storage.getUsername() === "") && !(Storage.getPassword() == null || Storage.getPassword() === ""),

    getUsername: () => localStorage.getItem(STORAGE_USERNAME_KEY),
    setUsername: (name) => localStorage.setItem(STORAGE_USERNAME_KEY, name),

    getPassword: () => localStorage.getItem(STORAGE_PASSWORD_KEY),
    setPassword: (password) => localStorage.setItem(STORAGE_PASSWORD_KEY, password),

    getServerUrl: () => localStorage.getItem(STORAGE_SERVER_KEY),
    setServerUrl: (url) => localStorage.setItem(STORAGE_SERVER_KEY, url),

    dump() {
        console.log("Dumping storage");

        let decks = this.getDecks();

        if (decks.length === 0) {
            console.log("No decks to dump");
        }

        for (let i = 0; i < decks.length; i++) {
            console.log(`${i}. ${decks[i].name}`);
            console.log(decks[i]);
            console.log(JSON.parse(localStorage.getItem(STORAGE_META_KEY)[i]));
        }
    }
}