import {InnerDeck} from "./innerDeck";

export class Deck {
    local: boolean;
    get name(): string {
        this.inner_deck.name = this._name;
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }
    private _name: string;
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
        this._name = deck.name;
        this.owner = null;
        this.is_public = false;
        this.inner_deck = deck;
        this.created_at = new Date();
        this.updated_at = new Date();
    }
}