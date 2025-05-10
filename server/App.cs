using System.Text.Json;
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

    public static Task Explore(HttpContext context, TrelaneDatabaseContext db) => context.Response.WriteAsJsonAsync(db.Decks.Take(5));

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
}