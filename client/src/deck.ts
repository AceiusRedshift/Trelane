import {InnerDeck} from "./innerDeck";

export class Deck {
    local: boolean;

    /**
     * Owner account GUID or null if local deck.
     */
    owner: string | null;
    is_public: boolean;
    inner_deck: InnerDeck;
    created_at: Date;
    updated_at: Date;

    constructor(deck: InnerDeck) {
        this.local = false;
        this.owner = null;
        this.is_public = false;
        this.inner_deck = deck;
        this.created_at = new Date();
        this.updated_at = new Date();
    }
}