using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Trelane.Server.Entities;

namespace Trelane.Server;

static class App
{
    public static Task Dash(HttpContext context, TrelaneDatabaseContext db)
    {
        int timesVisited = context.Session.GetInt32("v") ?? 0;
        timesVisited++;
        context.Session.SetInt32("v", timesVisited);

        return context.Response.WriteAsJsonAsync("acs");
    }

    //TODO context.Response.WriteAsJsonAsync(db.Decks.Take(5));
    public static Task Explore(HttpContext context, TrelaneDatabaseContext db) => context.Response.WriteAsJsonAsync("");

    public static Task Upload(HttpContext context, TrelaneDatabaseContext db)
    {
        try
        {
            using StreamReader reader = new(context.Request.Body);

            Deck deck = JsonSerializer.Deserialize<Deck>(reader.ReadToEnd(), JsonSerializerOptions.Web) ?? throw new NullReferenceException();
            deck.Id = Guid.NewGuid().ToString();

            foreach (Card deckCard in deck.Cards)
            {
                deckCard.Id = Guid.NewGuid().ToString();
            }

            db.Add(deck);
            db.SaveChanges();

            return context.Response.WriteAsJsonAsync(deck);
        }
        catch (NullReferenceException e)
        {
            Console.Error.WriteLine(e);

            context.Response.StatusCode = 400;
            return context.Response.WriteAsync(e.Message);
        }
        catch (Exception e)
        {
            Console.Error.WriteLine(e);

            context.Response.StatusCode = 500;
            return context.Response.WriteAsync(e.ToString());
        }
    }

    public static Task ValidateAccount(HttpContext context, TrelaneDatabaseContext db)
    {
        using StreamReader reader = new(context.Request.Body);

        Dictionary<string, string> body = JsonSerializer.Deserialize<Dictionary<string, string>>(reader.ReadToEnd(), JsonSerializerOptions.Web) ?? throw new NullReferenceException();
        Dictionary<string, object> response = new()
        {
            { "exists", db.CredentialsValid(body["username"], body["password"]) }
        };

        return context.Response.WriteAsJsonAsync(response);
    }

    internal record SetDeckRequest(string Username, string Password, Deck Deck);

    public static Task SetDeck(HttpContext context, TrelaneDatabaseContext db)
    {
        using StreamReader reader = new(context.Request.Body);

        SetDeckRequest body = JsonSerializer.Deserialize<SetDeckRequest>(reader.ReadToEnd(), JsonSerializerOptions.Web) ?? throw new NullReferenceException();
        if (db.CredentialsValid(body.Username, body.Password))
        {
            SavedDeck? deckToEdit = db.Users.Include(user => user.Decks).First(user => user.Username == body.Username).Decks.FirstOrDefault(deck => deck.InnerDeck.Name == body.Deck.Name);

            if (deckToEdit is null)
            {
                deckToEdit = new SavedDeck()
                {
                    Id = Guid.NewGuid().ToString(),
                    InnerDeck = body.Deck
                };

                db.Users.First(user => user.Username == body.Username).Decks.Add(deckToEdit);
            }
            else
            {
                deckToEdit.InnerDeck = body.Deck;
            }

            foreach (Card innerDeckCard in deckToEdit.InnerDeck.Cards)
            {
                innerDeckCard.Id = Guid.NewGuid().ToString();
            }

            db.SaveChanges();

            return context.Response.WriteAsJsonAsync(body.Deck);
        }
        else
        {
            context.Response.StatusCode = 400;
            return context.Response.WriteAsJsonAsync("Unauthorized");
        }
    }
}