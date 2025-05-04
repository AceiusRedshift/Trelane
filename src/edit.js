import m from "mithril";

export let Edit = {
    view: () => {
        if (CurrentDeck === null) {
            console.log("Deck is unloaded, cannot edit unloaded deck.")
            m.route.set(SPLASH_PATH);
        }

        if (CurrentDeck.cards.length === 0) {
            return m("p", "No cards in deck.")
        }

        return m(".user-list", CurrentDeck.cards.map(function (card) {
            return m(".user-list-item", card.front + " " + card.back)
        }))
    }
}