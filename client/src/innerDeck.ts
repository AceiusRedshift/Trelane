import {Card} from "./card";

/**
 * Represents the inner data of a deck.
 */
export class InnerDeck {
    name: string;
    author: string;
    cards: Card[];
    
    constructor(name: string, author: string, cards: Card[]) {
        this.name = name;
        this.author = author;
        this.cards = cards;
    }
}