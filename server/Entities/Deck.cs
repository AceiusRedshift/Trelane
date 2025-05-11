using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Trelane.Server.Entities;

public class Deck
{
    [Key]
    public string Id { get; set; }
    
    [MaxLength(100)]
    public string Name { get; set; }
    [MaxLength(100)]
    public string Author { get; set; }
    public ICollection<Card> Cards { get; set; }
}