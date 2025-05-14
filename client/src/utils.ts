import m from "mithril";
import {Toolbar} from "./toolbar";
import {Storage} from "./storage";
import {Deck} from "./deck";
import {Card} from "./card";
import {EDITOR_PATH} from "./constants";

export const button = (text: string, onclick: Function, css = "", tooltip = "") => m(
    "button",
    {
        className: css,
        onclick: onclick
    },
    text
);

export const isString = (value: any) => typeof value === 'string' || value instanceof String;

export const isValidDeck = (deck: any) => isString(deck.name) && isString(deck.author) && Array.isArray(deck.cards);

export const download = (content: any, fileName: string, contentType: string) => {
    let a = document.createElement("a");

    a.href = URL.createObjectURL(new Blob([content], {type: contentType}));
    a.download = fileName;
    a.click();
}

export const shuffle = (array: any[]) => {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

export const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const validateAccount = (server: string, username: string, password: string) => {
    console.log(`Attempting to login to ${server} as ${username}...`);

    Toolbar.statusText = "Logging in...";

    m.request({
        method: "POST",
        url: `${server}/get-account`,
        body: {
            username: username,
            password: password,
        },
        timeout: 5000,
        withCredentials: true
    }).then((response: any) => {
        if (response.exists) {
            Toolbar.statusText = "Login succeeded.";
        } else {
            Toolbar.statusText = "Login failed."
        }

        console.log(Toolbar.statusText)
    }).catch((error: Error) => {
        Toolbar.statusText = "Login Error: " + error.message;

        if (error.message === "Request timed out") {
            Toolbar.statusText = (navigator.onLine ? "Server" : "You're") + " offline."
        }
    });
}

const guidSegment = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

export const guid = () => `${guidSegment() + guidSegment()}-${guidSegment()}-${guidSegment()}-${guidSegment()}-${guidSegment()}${guidSegment()}${guidSegment()}`;

export const FileActions = {
    newDeck() {
        if (Storage.hasActiveDeck() && !confirm("Are you sure you want to create a new deck? One is already loaded, so this will overwrite it.")) {
            return;
        }

        Storage.setActiveDeck(new Deck("Untitled Deck", "You!", [new Card("", "")]));
        m.route.set(EDITOR_PATH);
    },

    loadDeck(index: number) {
        if (Storage.hasActiveDeck() && !confirm("Are you sure you want to load a new deck? Any unsaved changes will be lost.")) {
            return;
        }

        Storage.setActiveDeck(Storage.getDeck(index));
        m.route.set(EDITOR_PATH);
    }
}