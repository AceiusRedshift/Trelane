import m from "mithril";
import {Storage, Storage as Saver} from "./storage";
import {button, closeButton, validateAccount} from "./utils";
import {Toolbar} from "./toolbar";
import {Theme} from "./theme";

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
                        onfocusout: (e: { target: { value: string; }; }) => {
                            Saver.setEmail(e.target.value);

                            if (Saver.getPassword() !== "" && Saver.hasAccount()) {
                                validateAccount();
                            }
                        },
                    }),
                ])
            ),
            m("p",
                m("label", [
                    "Password: ",
                    m("input", {
                        type: "password",
                        value: Saver.getPassword(),
                        onfocusout: (e: { target: { value: string; }; }) => {
                            Saver.setPassword(e.target.value);

                            if (Saver.getEmail() !== "" && Saver.hasAccount()) {
                                validateAccount();
                            }
                        },
                    }),
                ])
            ),
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
                    `Cloud Features: `,
                    m("input", {
                        checked: Storage.getCloudFeaturesEnabled(),
                        type: "checkbox", oninput: (e: { target: { checked: boolean; }; }) => {
                            Storage.setCloudFeaturesEnabled(e.target.checked);
                        }
                    })
                ])
            ),
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
            Saver.getCloudFeaturesEnabled() && m(".buttons", [
                button("Sign in", () => showAccountModal = true),
            ]),
        ])),
        showAccountModal && m(AccountModal)
    ]
}