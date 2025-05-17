import m from "mithril";
import {Storage, Storage as Saver} from "./storage";
import {button, validateAccount} from "./utils";
import {CUSTOM_SERVER, LOCAL_SERVER, MAIN_SERVER} from "./constants";
import {Toolbar} from "./toolbar";

export let Settings = {
    view: () => m(".modal", m(".content", [
        m(".heading", [
            m("h1.title", "Settings"),
            m("h2.subtitle", "Configure Trelane."),
        ]),
        m("label", [
            `Enable cloud features?`,
            m("input", {
                checked: Storage.getActiveDeckMeta().sync,
                type: "checkbox", oninput: (e: { target: { checked: boolean; }; }) => {
                    Storage.setCloudFeaturesEnabled(e.target.checked);
                }
            })
        ]),
       Saver.getCloudFeaturesEnabled() && [
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
                        m("option", {value: LOCAL_SERVER, selected: Saver.getServerUrl() === LOCAL_SERVER}, "Localhost"),
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
        ],
        m("p", Toolbar.statusText),
        m(".buttons", [
            button("Close", () => Toolbar.hideSettings())
        ])
    ]))
}