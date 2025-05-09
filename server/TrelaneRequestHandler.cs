namespace Trelane.Server;

delegate Task TrelaneRequestHandler(HttpContext context, TrelaneDatabaseContext db);