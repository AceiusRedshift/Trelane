import { EDITOR_PATH, KAOMOJI_LIST } from "./constants";
import { InnerDeck } from "./innerDeck";
import { Storage } from "./storage";
import { Network } from "./network";
import { Toolbar } from "./toolbar";
import { Card } from "./card";
import { Deck } from "./deck";
import m from "mithril";

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

    a.href = URL.createObjectURL(new Blob([content], { type: contentType }));
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

export const validateAccount = () => {
    console.log(`Attempting to login as ${Storage.email}...`);

    Toolbar.statusText = "Logging in...";
    Network.hasAccount().then(hasAccount => {
        if (!hasAccount) {
            Network.signIn().then(response => {
                if (response.error != null) {
                    Toolbar.statusText = response.error.message + " :(";
                } else {
                    Toolbar.statusText = "Welcome back! " + getRandomKaomoji();
                }
            }).catch(error => {
                Toolbar.statusText = "Login failed: " + error;
                console.log(error);
            });
        } else {
            Toolbar.statusText = "Welcome back! " + getRandomKaomoji();
        }
    });
}

const guidSegment = () => ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);

export const guid = () => `${guidSegment() + guidSegment()}-${guidSegment()}-${guidSegment()}-${guidSegment()}-${guidSegment()}${guidSegment()}${guidSegment()}`;

export const FileActions = {
    newDeck() {
        if (Storage.activeDeck != null && !confirm("Are you sure you want to create a new deck? One is already loaded, so this will overwrite it.")) {
            return;
        }

        Storage.activeDeck = new Deck(new InnerDeck("Untitled Deck", "You!", [new Card("", "")]));
        m.route.set(EDITOR_PATH);
    },

    loadDeck(index: number) {
        if (Storage.activeDeck != null && !confirm("Are you sure you want to load a new deck? Any unsaved changes will be lost.")) {
            return;
        }

        Storage.activeDeck = Storage.decks[index];
        m.route.set(EDITOR_PATH);
    }
}

export const closeButton = (onclick: Function) => button("×", onclick, "close")

export const getRandomKaomoji = () => KAOMOJI_LIST[Math.floor(Math.random() * KAOMOJI_LIST.length)];