using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Trelane.Server.Entities;

[Owned]
public class Card
{
    [Key]
    public string Id { get; set; }
    
    public string Front { get; set; }
    public string Back { get; set; }
}