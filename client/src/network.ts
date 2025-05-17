import m from "mithril";
import {Storage as Saver, Storage} from "./storage";
import {Deck} from "./deck";

export const Network = {
    exploreDecks(): Promise<Deck[]> {
        return m.request({
            method: "GET",
            url: `${Storage.getServerUrl()}/explore`,
            timeout: 5000,
        });
    },

    uploadDeck(deck: Deck): Promise<void> {
        return m.request({
            method: "POST",
            url: `${Storage.getServerUrl()}/set-deck`,
            body: {
                username: Storage.getUsername(),
                password: Storage.getPassword(),
                deck: deck,
            },
            timeout: 5000,
            withCredentials: true
        });
    },
    downloadDecks(): Promise<Deck[]> {
        return m.request({
            method: "POST",
            url: `${Saver.getServerUrl()}/get-decks`,
            body: {
                username: Saver.getUsername(),
                password: Saver.getPassword(),
            },
            timeout: 5000,
            withCredentials: true
        });
    },

    validateAccount() {
        return m.request({
            method: "POST",
            url: `${Storage.getServerUrl()}/get-account`,
            body: {
                username: Storage.getUsername(),
                password: Storage.getPassword(),
            },
            timeout: 5000,
            withCredentials: true
        })
    }
}