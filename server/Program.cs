using Microsoft.AspNetCore.Server.Kestrel.Core;
using Trelane.Server;
using static Trelane.Server.App;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(2);
    options.Cookie.IsEssential = true;
});
builder.Services.AddDbContext<TrelaneDatabaseContext>();
builder.Services.Configure<KestrelServerOptions>(options => options.AllowSynchronousIO = true);

var app = builder.Build();
app.UseSession();
app.MapGet("/", () => "Hello World!");
app.MapGet("/-", c => WrapContext(c, Dash));
app.MapGet("/explore", c => WrapContext(c, Explore));
app.MapPost("/new", c => WrapContext(c, Upload));
app.MapPost("/validate-account", c => WrapContext(c, ValidateAccount));
app.MapPost("/set-deck", c => WrapContext(c, SetDeck));
app.MapGet("/u1", c => WrapContext(c, (context, db) => context.Response.WriteAsJsonAsync(db.Users.First().ToString())));

app.Run();

return;

static Task WrapContext(HttpContext context, TrelaneRequestHandler handler)
{
    try
    {
        return handler(context, context.RequestServices.GetService(typeof(TrelaneDatabaseContext)) as TrelaneDatabaseContext ?? throw new ArgumentNullException());
    }
    catch (Exception e)
    {
        // Don't want to crash the server
        context.Response.StatusCode = 500;
        return context.Response.WriteAsJsonAsync(e.Message);
    }
}