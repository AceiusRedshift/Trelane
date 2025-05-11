using System.ComponentModel.DataAnnotations;

namespace Trelane.Server.Entities;

public class SavedDeck
{
    [Key]
    public string Id { get; set; }
    
    /// <summary>
    /// The upvote count is something the server keeps track of for trending cards
    /// </summary>
    public int Upvotes { get; set; }
    public bool Public { get; set; }
    
    public Deck InnerDeck { get; set; }
}