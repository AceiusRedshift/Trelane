import {STORAGE_MAIN_KEY} from "./constants";
import {isDarkMode} from "./utils";
import {Toolbar} from "./toolbar";
import {Network} from "./network";
import {Theme} from "./theme";
import {Deck} from "./deck";
// @ts-ignore
import {version} from "../package.json";

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
            if (decks[i].inner_deck.name === deck.inner_deck.name) {
                this.decks[i] = deck;
                return;
            }
        }

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

function sync() {
    Network.hasAccount().then((hasAccount) => {
        if (hasAccount) {
            Toolbar.statusText = "Synchronization initialized...";

            console.group("Synchronizing...")

            console.debug("Downloading server decks");

            Network.downloadMyDecks().then(serverDecks => {
                console.debug(serverDecks);
                for (let i = 0; i < Storage.decks.length; i++) {
                    const localDeck = Storage.decks[i];

                    if (localDeck.local) return;

                    if (serverDecks.some(d => d.inner_deck.name === localDeck.inner_deck.name)) {
                        console.debug("Found synchronized deck", localDeck.inner_deck.name);

                        let serverDeck = <Deck>serverDecks.find(d => d.inner_deck.name === localDeck.inner_deck.name);

                        let serverDeckIsNewer = localDeck.updated_at < serverDeck.updated_at;
                        if (serverDeckIsNewer) {
                            console.debug("Server deck is newer, downloading");
                            Storage.decks[i] = serverDeck;
                        } else {
                            console.debug("Local deck is newer, uploading");
                            Network.addOrUpdateDeck(localDeck);
                        }
                    } else {
                        console.debug("Found un-synchronized deck", localDeck.inner_deck.name);
                        Network.addOrUpdateDeck(localDeck);
                    }
                }

                console.groupEnd();
                Toolbar.statusText = "Synchronization completed at " + (new Date()).toLocaleTimeString();
            }).catch(reason => {
                console.error(reason);
                console.groupEnd();

                Toolbar.statusText = "Synchronization error: " + reason;
            });
        } else {
            Toolbar.statusText = "Data saved locally at " + (new Date()).toLocaleTimeString();
        }
    });
}

export const Storage = loadStorage();

setInterval(() => localStorage.setItem(STORAGE_MAIN_KEY, JSON.stringify(Storage)), 500);
setInterval(() => document.hasFocus() && sync(), 10000);

document.onblur = sync;