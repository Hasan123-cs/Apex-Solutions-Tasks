using Microsoft.EntityFrameworkCore;
using SignalRCounter;
using SignalRCounter.Background;
using SignalRCounter.Data;
using SignalRCounter.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddSingleton<CounterService>();
builder.Services.AddDbContext<AppDbContext>(
options =>
options.UseSqlServer(
builder.Configuration.GetConnectionString("DefaultConnection")
));
builder.Services.AddHostedService<UserCreationBackgroundService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseStaticFiles();
app.UseHttpsRedirection();
app.MapHub<CounterHub>("/counterHub");
app.MapHub<UserHub>("/userHub");
app.Run();

