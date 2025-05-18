import m from "mithril";
import {Storage, Storage as Saver} from "./storage";
import {button, closeButton, validateAccount} from "./utils";
import {CUSTOM_SERVER, LOCAL_SERVER, MAIN_SERVER} from "./constants";
import {Toolbar} from "./toolbar";
import {Theme} from "./theme";

let showAccountModal = false;
let AccountModal = {
    view: () => m(".modal", m(".content", [
        [
            closeButton(() => showAccountModal = false),
            m("p", [
                m("label", {for: "load-file-select"}, [
                    "Server URL: ",
                    m("select", {
                        value: Saver.getServerUrl(),
                        onchange: (e: { target: { value: string; }; }) => {
                            Saver.setServerUrl(e.target.value);
                            validateAccount(e.target.value, Saver.getUsername(), Saver.getPassword());
                        },
                    }, [
                        m("option", {value: MAIN_SERVER, selected: Saver.getServerUrl() === MAIN_SERVER}, "Aceius.org"),
                        m("option", {
                            value: LOCAL_SERVER,
                            selected: Saver.getServerUrl() === LOCAL_SERVER
                        }, "Localhost"),
                        m("option", {
                            value: CUSTOM_SERVER,
                            selected: Saver.getServerUrl() !== MAIN_SERVER && Saver.getServerUrl() !== LOCAL_SERVER
                        }, "Custom")
                    ])
                ])
            ]),
            m("p",
                m("label", [
                    "Username: ",
                    m("input", {
                        type: "text",
                        value: Saver.getUsername(),
                        onfocusout: (e: { target: { value: string; }; }) => {
                            Saver.setUsername(e.target.value);

                            if (Saver.getPassword() !== "" && Saver.hasAccount()) {
                                validateAccount(Saver.getServerUrl(), e.target.value, Saver.getPassword());
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

                            if (Saver.getUsername() !== "" && Saver.hasAccount()) {
                                validateAccount(Saver.getServerUrl(), Saver.getUsername(), e.target.value);
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