using System.ComponentModel.DataAnnotations;

namespace Trelane.Server.Entities;

public class SavedDeck
{
    [Key]
    public string Id { get; set; }
    
    public Deck InnerDeck { get; private set; }
}