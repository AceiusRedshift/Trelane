using System.ComponentModel.DataAnnotations;

namespace Trelane.Server.Entities;

public class User
{
    public string Id { get; set; }
    
    [MaxLength(64)]
    public string Username { get; set; }
    
    [MaxLength(128)]
    public string Password { get; set; }
}