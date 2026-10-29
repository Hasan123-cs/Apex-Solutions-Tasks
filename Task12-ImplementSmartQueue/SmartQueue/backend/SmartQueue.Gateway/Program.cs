var builder = WebApplication.CreateBuilder(args);
Console.WriteLine("GATEWAY TEST - NEW CODE IS RUNNING");
Console.WriteLine("SignalR route: " +
    builder.Configuration["ReverseProxy:Routes:signalr-route:Match:Path"]);
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services
    .AddReverseProxy()
    .LoadFromConfig(
        builder.Configuration.GetSection("ReverseProxy")
    );

Console.WriteLine(
    "SignalR route: " +
    builder.Configuration[
        "ReverseProxy:Routes:signalr-route:Match:Path"]
);

var app = builder.Build();

app.UseRouting();

app.UseCors("ReactFrontend");

app.MapReverseProxy();

app.Run();