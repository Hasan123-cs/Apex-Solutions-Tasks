using TaskManagement.Application;
using TaskManagement.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddApplication();

builder.Services.AddInfrastructure(
    builder.Configuration);

var app = builder.Build();

app.UseHttpsRedirection();
// Serve static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();

app.Run();