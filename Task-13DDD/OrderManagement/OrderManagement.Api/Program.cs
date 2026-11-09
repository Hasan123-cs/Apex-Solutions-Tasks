
using OrderManagement.Application.Interfaces;
using OrderManagement.Application.Services;
using OrderManagement.Domain.Repositories;
using OrderManagement.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// API Controllers
builder.Services.AddControllers();

// OpenAPI documentation
builder.Services.AddOpenApi();

// Application Layer
builder.Services.AddScoped<IOrderService, OrderService>();

// Infrastructure Layer
builder.Services.AddSingleton<
    IOrderRepository,
    InMemoryOrderRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();


app.Run();
