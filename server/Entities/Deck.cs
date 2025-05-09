using System.ComponentModel.DataAnnotations;

namespace Trelane.Server.Entities;

public class Deck
{
    [Key]
    public string Id { get; set; }
    /// <summary>
    /// The upvote count is something the server keeps track of for trending cards
    /// </summary>
    public int Upvotes { get; set; }
    
    [MaxLength(100)]
    public string Name { get; set; }
    [MaxLength(100)]
    public string Author { get; set; }
    public ICollection<Card> Cards { get; set; }
}