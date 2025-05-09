using Microsoft.EntityFrameworkCore;
using Trelane.Server.Entities;

namespace Trelane.Server;

public sealed class TrelaneDatabaseContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Deck> Decks { get; set; }

    public TrelaneDatabaseContext(DbContextOptions<TrelaneDatabaseContext> options) : base(options)
    {
        Database.EnsureCreated();
    }
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) => optionsBuilder.UseSqlite("Data Source=Trelane.db");
}