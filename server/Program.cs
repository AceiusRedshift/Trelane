var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(2);
    options.Cookie.IsEssential = true;
});

var app = builder.Build();
app.UseSession();
app.MapGet("/", () => "Hello World!");
app.MapGet("/-", Dash);

Task Dash(HttpContext context)
{
    int timesVisited = context.Session.GetInt32("v") ?? 0;
    timesVisited++;
    context.Session.SetInt32("v", timesVisited);
    return context.Response.WriteAsync($"Visited: {timesVisited} | {DateTime.Now}");
}

app.Run();