import {Storage} from "./storage";
import {InnerDeck} from "./innerDeck";
import {createClient} from "@supabase/supabase-js";
import {SUPABASE_KEY, SUPABASE_URL} from "./constants";

export class Network {
    private static readonly supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    static exploreDecks(): Promise<InnerDeck[]> {
        return new Promise<InnerDeck[]>((resolve, reject) => this.supabase
            .from("decks")
            .select()
            .eq("is_public", true)
            .then(response => response.data != null ? resolve(response.data.map(col => <InnerDeck>col.inner)) : reject(response.error)));
    }

    static addOrUpdateDeck(deck: InnerDeck) {
        return this.supabase
            .from("decks")
            .select()
            .eq("name", deck.name)
            .then(response => {
                if (response.data != null && response.data.length > 0) {
                    return this.supabase.from("decks").update({
                        inner: deck,
                        public: Storage.getActiveDeckMeta().isPublic
                    }).eq("name", deck.name);
                } else {
                    return this.supabase.from("decks").insert({
                        inner: deck,
                        public: Storage.getActiveDeckMeta().isPublic
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
            email: Storage.getEmail(),
            password: Storage.getPassword()
        });
    }

    static signUp() {
        return this.supabase.auth.signUp({
            email: Storage.getEmail(),
            password: Storage.getPassword()
        });
    }

    static hasAccount() {
        return this.supabase.auth
            .getUser()
            .then(response => response.data.user != null)
    }
}