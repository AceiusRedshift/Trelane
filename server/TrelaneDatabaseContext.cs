using Microsoft.EntityFrameworkCore;
using Trelane.Server.Entities;

namespace Trelane.Server;

public class TrelaneDatabaseContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Deck> Decks { get; set; }
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) => optionsBuilder.UseSqlite("Data Source=Trelane.db");
}