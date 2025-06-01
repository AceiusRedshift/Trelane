import { button, closeButton, getRandomKaomoji } from "./utils";
import { Storage } from "./storage";
import { Toolbar } from "./toolbar";
import { Network } from "./network";
import { Theme } from "./theme";
import m from "mithril";

let showAccountModal = false;
let AccountModal = {
    view: () => m(".modal", m(".content", [
        closeButton(() => showAccountModal = false),
        m("p",
            m("label", [
                "Username: ",
                m("input", {
                    type: "text",
                    value: Storage.email,
                    onfocusout: (e: { target: { value: string; }; }) => Storage.email = e.target.value,
                }),
            ])
        ),
        m("p",
            m("label", [
                "Password: ",
                m("input", {
                    type: "password",
                    value: Storage.password,
                    onfocusout: (e: { target: { value: string; }; }) => Storage.password = e.target.value,
                }),
            ])
        ),
        m(".buttons", [
            button("Sign in", () =>
                Network.signIn().then(response => {
                    if (response.error != null) {
                        Toolbar.statusText = response.error.message + " :(";
                    } else {
                        Toolbar.statusText = "Welcome back! " + getRandomKaomoji();
                    }

                    console.log(response);
                }).catch(error => {
                    Toolbar.statusText = "Login failed: " + error;
                    console.log(error);
                })
            ),
            button("Sign up", () =>
                Network.signUp().then(response => {
                    if (response.error != null) {
                        Toolbar.statusText = response.error.message + " :(";
                    } else {
                        Toolbar.statusText = "Welcome to Trelane! " + getRandomKaomoji();
                    }

                    console.log(response);
                }).catch(error => {
                    Toolbar.statusText = "Signup failed: " + error;
                    console.log(error);
                })
            )
        ]),
        m("p", Toolbar.statusText),
    ]))
}

export let Settings = {
    view: () => [
        m(".modal", m(".content", [
            closeButton(() => Toolbar.hideSettings()),
            m("p",
                m("label", [
                    "Theme: ",
                    m(
                        "select",
                        {
                            onchange: (e: {
                                target: { value: string | null; };
                            }) => {
                                let theme = <Theme>e.target.value;
                                Storage.userTheme = theme;

                                Storage.userTheme = theme;
                                document.body.setAttribute("data-theme", Storage.userTheme.toString().toLowerCase());
                            }
                        },
                        Object.keys(Theme).map((key: string) => m("option", {
                            value: key.toLowerCase(),
                            selected: Storage.userTheme.toString().toLowerCase() == key.toLowerCase()
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