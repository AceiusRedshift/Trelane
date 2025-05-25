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
        this.supabase.auth.getUser().then(user => {
            if (user.data.user?.id == null) {
                throw new Error("No user object");
            }

            let userId = user.data.user.id;
            return this.supabase
                .from("decks")
                .select()
                .eq("name", deck.inner_deck.name)
                .then(response => {
                    if (response.data != null && response.data.length > 0) {
                        return this.supabase.from("decks").update({
                            is_public: deck.is_public,
                            inner_deck: deck.inner_deck,
                            updated_at: (new Date()).toISOString(),
                        }).eq("name", deck.inner_deck.name).eq("owner", userId);
                    } else {
                        return this.supabase.from("decks").insert({
                            name: deck.inner_deck.name,
                            is_public: deck.is_public,
                            inner_deck: deck.inner_deck,
                            updated_at: (new Date()).toISOString(),
                            created_at: (new Date()).toISOString(),
                        })
                    }
                });
        })
    }

    static downloadMyDecks(): Promise<Deck[]> {
        return this.supabase.auth
            .getUser()
            .then(response => <Promise<Deck[]>>this.supabase
                .from("decks")
                .select()
                .eq("owner", response.data.user?.id)
                .then(response => response.data == null ? [] : response.data.map(col => {
                    let castColumn = <Deck>col;
                    castColumn.inner_deck = JSON.parse(col.inner_deck);
                    return castColumn;
                }))
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

    static removeDeck(name: string) {
        return this.supabase.auth
            .getUser()
            .then(response => this.supabase
                .from("decks")
                .delete()
                .eq("owner", response.data.user?.id)
                .eq("name", name)
            );
    }
}