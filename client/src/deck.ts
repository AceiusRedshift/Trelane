import {Card} from "./card";

export class Deck {
    name: string;
    author: string;
    cards: Card[];
    
    constructor(name: string, author: string, cards: Card[]) {
        this.name = name;
        this.author = author;
        this.cards = cards;
    }
}