import {Storage} from "./storage";
import {InnerDeck} from "./innerDeck";
import {createClient} from "@supabase/supabase-js";
import {SUPABASE_KEY, SUPABASE_URL} from "./constants";
import {Deck} from "./deck";

export class Network {
    private static readonly supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    static exploreDecks(): Promise<Deck[]> {
        return new Promise<Deck[]>((resolve, reject) => this.supabase
            .from("decks")
            .select()
            .eq("is_public", true)
            .then(response => response.data != null ? resolve(response.data) : reject(response.error)));
    }

    static addOrUpdateDeck(deck: Deck) {
        return this.supabase
            .from("decks")
            .select()
            .eq("name", deck.name)
            .then(response => {
                if (response.data != null && response.data.length > 0) {
                    return this.supabase.from("decks").update({
                        inner: deck.inner_deck,
                        is_public: deck.is_public
                    }).eq("name", deck.name);
                } else {
                    return this.supabase.from("decks").insert({
                        inner: deck.inner_deck,
                        is_public: deck.is_public
                    })
                }
            });
    }

    static downloadMyDecks(): Promise<InnerDeck[]> {
        return this.supabase.auth
            .getUser()
            .then(response => <Promise<InnerDeck[]>>this.supabase
                .from("decks")
                .select()
                .eq("owner", response.data.user?.id)
                .then(response => {
                    if (response.data == null) return [];
                    return response.data.map(col => <InnerDeck>col.inner);
                })
            );
    }

    static signIn() {
        return this.supabase.auth.signInWithPassword({
            email: Storage.email,
            password: Storage.password
        });
    }

    static signUp() {
        return this.supabase.auth.signUp({
            email: Storage.email,
            password: Storage.password
        });
    }

    static hasAccount() {
        return this.supabase.auth
            .getUser()
            .then(response => response.data.user != null)
    }
}