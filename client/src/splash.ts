import {button, closeButton, FileActions, getRandomKaomoji} from "./utils";
import {EDITOR_PATH, HELP_PATH} from "./constants";
import {Storage} from "./storage";
import {Network} from "./network";
import {Toolbar} from "./toolbar";
import {Deck} from "./deck";
import m from "mithril";

let onboardingShowStatus = false;
let showOnboarding = Storage.first_visit;
let Onboarding = {
    view: () => m(".modal.login-modal", m(".content", [
        [
            closeButton(() => showOnboarding = false),
            m("h1.title", "Hiii! ヾ(*ﾟ▽ﾟ)ﾉ"),
            m("p", [
                "It looks like this is your first time using Trelane on this browser.",
                m("br"),
                "Welcome! "
            ]),
            m("p.hint", "(You don't have to sign up... but if you do you can back up your decks to the cloud!)"),
            m("p",
                m("label", [
                    "Username: ",
                    m("input", {
                        type: "text",
                        value: Storage.email,
                        onfocusout: (e: { target: { value: string; }; }) => Storage.email = (e.target.value),
                    }),
                ])
            ),
            m("p",
                m("label", [
                    "Password: ",
                    m("input", {
                        type: "password",
                        value: Storage.password,
                        onfocusout: (e: { target: { value: string; }; }) => Storage.password = (e.target.value),
                    }),
                ])
            ),
            m(".buttons", [
                button("Sign in", () =>
                    Network.signIn().then((response) => {
                        if (response.error != null) {
                            Toolbar.statusText = response.error.message + " :(";
                        } else {
                            Toolbar.statusText = "Welcome back! " + getRandomKaomoji();
                        }

                        console.log(response);
                    }).catch((error) => {
                        Toolbar.statusText = "Login failed: " + error;
                        console.log(error);
                    }).finally(() => {
                        m.redraw()
                        onboardingShowStatus = true;
                    })
                ),
                button("Sign up", () =>
                    Network.signUp().then((response) => {
                        if (response.error != null) {
                            Toolbar.statusText = response.error.message + " :(";
                        } else {
                            Toolbar.statusText = "Welcome to Trelane! " + getRandomKaomoji();
                        }

                        console.log(response);
                    }).catch((error) => {
                        Toolbar.statusText = "Signup failed: " + error;
                        console.log(error);
                    }).finally(() => {
                        m.redraw()
                        onboardingShowStatus = true;
                    })
                )
            ]),
            onboardingShowStatus ? m("p", {style: "text-align: center;"}, Toolbar.statusText) : [
                m("br"),
                m("details.hint", [
                    m("summary", "The fine print"),
                    [
                        m("p", "I haven't written a terms of service yet, but if I notice you doing any of the following I will delete your account:"),
                        m("p", "Spam, bigotry, bullying, NSFW, XSS"),
                        m("p", "I may also send you emails when Trelane gets big updates.")
                    ]
                ]),
            ]
        ]
    ]))
}

let showExplore = false;
let exploreDecks: Deck[] | null = [];
let Explore = {
    fetchDecks: () => {
        Network.exploreDecks().then((response) => {
            exploreDecks = response;
        }).catch((error) => {
            Toolbar.statusText = "Explore Error: " + error.message;

            if (error.message === "Request timed out") {
                Toolbar.statusText = (navigator.onLine ? "Server" : "You're") + " offline."
            }
        }).finally(() => m.redraw());
    },
    view: () => m(".modal", m(".content", [
        m(".heading", [
            m("h1.title", "Explore"),
            m("h2.subtitle", `Decks from Fellow Students :D`),
        ]),
        m("br"),
        (exploreDecks == null || exploreDecks.length === 0) ? m("p", "No decks on cloud :c") :
            m("table", exploreDecks.map((deck, i, _) => {
                const loadDeck = () => {
                    if (Storage.activeDeck != null && !confirm("Are you sure you want to load a new deck? Any unsaved changes will be lost.")) {
                        return;
                    }

                    Storage.activeDeck = (deck);
                    m.route.set(EDITOR_PATH);
                }

                return m("tr.load-table", [
                    m("td", {onclick: loadDeck}, deck.name),
                    m("td", {onclick: loadDeck}, deck.inner_deck.author),
                    m("td", {onclick: loadDeck}, deck.inner_deck.cards.length + " cards"),
                    m("td.load-table-solid", [
                        m("a", {onclick: loadDeck}, "Load"),
                        // " ",
                        // m("a", {
                        //     onclick: () => {
                        //         if (confirm("Are you sure you want to delete this deck?")) {
                        //             Storage.removeDeck(i);
                        //         }
                        //     }
                        // }, "Delete")
                    ])
                ]);
            })),
        m("br"),
        m(".buttons", button("Back", () => showExplore = false))
    ]))
}

export let Splash = {
    view: () => m("#splash", [
        m("header", [
            m("h1.title", "Trelane"),
            m("h2.subtitle", "A semi-competent memorization tool."),
        ]),
        m(".row-2.max-width", [
            m(".column", [
                m("h3", "Quick Actions"),
                m("ul", [
                    m("li", m("button.link-button", {onclick: FileActions.newDeck}, "New Deck")),
                    m("li", m("button.link-button", {onclick: Toolbar.showLoader}, "Open Deck")),
                    m("li", m("button.link-button", {onclick: () => m.route.set(HELP_PATH)}, "Help"))
                ])
            ]),
            Storage.decks.length > 0 && m(".column", [
                m("h3", "Recent"),
                m("ul", [
                    Storage.decks.slice(-Math.min(Storage.decks.length, 5) + (Storage.activeDeck != null ? 1 : 0)).map((deck, i, _) => {
                        return m("li", m("button.link-button", {onclick: () => FileActions.loadDeck(i)}, deck.name));
                    })
                ])
            ])
        ]),
        m(".buttons", [
            button("Explore Decks Online", () => {
                showExplore = true;
                Explore.fetchDecks();
            }, "", "Discover decks published by other users of Trelane."),
            Storage.activeDeck != null && button(`Continue Editing '${Storage.activeDeck.name}'`, () => m.route.set(EDITOR_PATH)),
        ]),
        showExplore && m(Explore),
        showOnboarding && m(Onboarding)
    ])
}