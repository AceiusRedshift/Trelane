using Microsoft.EntityFrameworkCore;
using Trelane.Server.Entities;

namespace Trelane.Server;

public sealed class TrelaneDatabaseContext : DbContext
{
    public DbSet<User> Users { get; set; }

    public TrelaneDatabaseContext(DbContextOptions<TrelaneDatabaseContext> options) : base(options)
    {
        Database.EnsureCreated();
    }

    public bool CredentialsValid(string username, string password) => Users.Any(u => u.Username == username && u.Password == password);

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) => optionsBuilder
        .UseSqlite("Data Source=Trelane.db")
        .UseSeeding((context, _) =>
        {
            context.Set<User>().Add(new User() { Id = Guid.NewGuid().ToString(), Username = "admin", Password = new Random().Next().ToString(), Decks = [] });
            context.SaveChanges();
        });

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SavedDeck>().OwnsOne(savedDeck => savedDeck.InnerDeck, innerDeck => innerDeck.OwnsMany(d => d.Cards));
    }
}