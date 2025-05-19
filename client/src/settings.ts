import m from "mithril";
import {Storage, Storage as Saver} from "./storage";
import {button, closeButton, getRandomKaomoji, validateAccount} from "./utils";
import {Toolbar} from "./toolbar";
import {Theme} from "./theme";
import {Network} from "./network";

let showAccountModal = false;
let AccountModal = {
    view: () => m(".modal", m(".content", [
        [
            closeButton(() => showAccountModal = false),
            m("p",
                m("label", [
                    "Username: ",
                    m("input", {
                        type: "text",
                        value: Saver.getEmail(),
                        onfocusout: (e: { target: { value: string; }; }) => Saver.setEmail(e.target.value),
                    }),
                ])
            ),
            m("p",
                m("label", [
                    "Password: ",
                    m("input", {
                        type: "password",
                        value: Saver.getPassword(),
                        onfocusout: (e: { target: { value: string; }; }) => Saver.setPassword(e.target.value),
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
                    }).finally(() => m.redraw())
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
                    }).finally(() => m.redraw())
                )
            ]),
            m("p", Toolbar.statusText),
        ]
    ]))
}

let userTheme: Theme;
export let Settings = {
    oninit: () => {
        userTheme = Storage.getUserTheme();
    },
    view: () => [
        m(".modal", m(".content", [
            closeButton(() => Toolbar.hideSettings()),
            m("p",
                m("label", [
                    "Theme: ",
                    m(
                        "select",
                        {
                            // value: selectedFormat || "",
                            onchange: (e: {
                                target: { value: string | null; };
                            }) => {
                                let theme = <Theme>e.target.value;
                                userTheme = theme;

                                Storage.setUserTheme(theme);
                                document.body.setAttribute("data-theme", userTheme.toString().toLowerCase());
                            }
                        },
                        Object.keys(Theme).map((key: string) => m("option", {
                            value: key.toLowerCase(),
                            selected: userTheme.toString().toLowerCase() == key.toLowerCase()
                        }, key))
                    ),
                ])
            ),
            m(".buttons", [
                button("Account Switcher", () => showAccountModal = true),
            ]),
        ])),
        showAccountModal && m(AccountModal)
    ]
}