using Microsoft.EntityFrameworkCore;
using Trelane.Server.Areas.Identity.Data.Trelane;
using Trelane.Server.Data.Trelane;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("ServerContextConnection") ?? throw new InvalidOperationException("Connection string 'ServerContextConnection' not found.");
builder.Services.AddDbContext<ServerContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddDefaultIdentity<ServerUser>(options => options.SignIn.RequireConfirmedAccount = true).AddEntityFrameworkStores<ServerContext>();

var app = builder.Build();
app.MapGet("/", () => "Hello World!");

app.Run();