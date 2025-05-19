import m from "mithril";
import {Storage as Saver, Storage} from "./storage";
import {Deck} from "./deck";
import {AuthTokenResponsePassword, createClient} from "@supabase/supabase-js";
import {SUPABASE_KEY, SUPABASE_URL} from "./constants";

export class Network {
    private static readonly supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    static exploreDecks(): Promise<Deck[]> {
        return <Promise<Deck[]>>this.supabase.from("decks").select().eq("public", true).then(response => {
            if (response.data == null) {
                console.warn("null server response");
                return [];
            }
            return response.data.map(col => <Deck>col.inner);
        });
    }

    static addOrUpdateDeck(deck: Deck) {
        return this.supabase.from("decks").select().eq("name", deck.name).then(response => {
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

    static downloadMyDecks(): Promise<Deck[]> {
        return this.supabase.auth.getUser().then(response => {
            return <Promise<Deck[]>>this.supabase.from("decks").select().eq("owner", response.data.user?.id).then(response => {
                if (response.data == null) return [];
                return response.data.map(col => <Deck>col.inner);
            });
        })
    }

    static signIn() {
        return this.supabase.auth.signInWithPassword({
            email: Saver.getEmail(),
            password: Saver.getPassword()
        });
    }
}