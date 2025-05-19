import m from "mithril";
import {Storage as Saver, Storage} from "./storage";
import {Deck} from "./deck";
import {AuthTokenResponsePassword, createClient} from "@supabase/supabase-js";
import {SUPABASE_KEY, SUPABASE_URL} from "./constants";

export class Network {
    private static readonly supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    public static getSupabaseInstance() {
        return this.supabase;
    }

    static exploreDecks(): Promise<Deck[]> {
        return m.request({
            method: "GET",
            url: `${Storage.getServerUrl()}/explore`,
            timeout: 5000,
        });
    }

    static uploadDeck(deck: Deck): Promise<void> {
        return m.request({
            method: "POST",
            url: `${Storage.getServerUrl()}/set-deck`,
            body: {
                username: Storage.getEmail(),
                password: Storage.getPassword(),
                deck: deck,
            },
            timeout: 5000,
            withCredentials: true
        });
    }

    static downloadDecks(): Promise<Deck[]> {
        return m.request({
            method: "POST",
            url: `${Saver.getServerUrl()}/get-decks`,
            body: {
                username: Saver.getEmail(),
                password: Saver.getPassword(),
            },
            timeout: 5000,
            withCredentials: true
        });
    }

    static signIn() {
        return this.supabase.auth.signInWithPassword({
            email: Saver.getEmail(),
            password: Saver.getPassword()
        });
    }
}