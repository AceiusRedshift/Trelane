namespace Trelane.Server.Entities;

public class Deck(string name, string author, Card[] cards)
{
    public string Name { get; init; } = name;
    public string Author { get; init; } = author;
    public Card[] Cards { get; init; } = cards;

    public void Deconstruct(out string Name, out string Author, out Card[] Cards)
    {
        Name = this.Name;
        Author = this.Author;
        Cards = this.Cards;
    }
}