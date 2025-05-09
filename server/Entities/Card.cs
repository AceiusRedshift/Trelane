namespace Trelane.Server.Entities;

public class Card(string front, string back)
{
    public string Front { get; init; } = front;
    public string Back { get; init; } = back;

    public void Deconstruct(out string Front, out string Back)
    {
        Front = this.Front;
        Back = this.Back;
    }
}