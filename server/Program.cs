using Trelane.Server;
using Trelane.Server.Entities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(2);
    options.Cookie.IsEssential = true;
});
builder.Services.AddDbContext<TrelaneDatabaseContext>();

var app = builder.Build();
app.UseSession();
app.MapGet("/", () => "Hello World!");
app.MapGet("/-", c => WrapContext(c, Dash));
app.MapGet("/explore", c => WrapContext(c, Explore));


app.Run();

return;

static Task WrapContext(HttpContext context, TrelaneRequestHandler handler) => handler(context, context.RequestServices.GetService(typeof(TrelaneDatabaseContext)) as TrelaneDatabaseContext ?? throw new ArgumentNullException());

static Task Dash(HttpContext context, TrelaneDatabaseContext db)
{
    int timesVisited = context.Session.GetInt32("v") ?? 0;
    timesVisited++;
    context.Session.SetInt32("v", timesVisited);

    return context.Response.WriteAsJsonAsync("acs");
}

static Task Explore(HttpContext context, TrelaneDatabaseContext db) => context.Response.WriteAsJsonAsync(db.Decks.Take(5));