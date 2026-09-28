using Microsoft.EntityFrameworkCore;
using UserManagement.Data;
using UserManagement.Services;
using Enyim.Caching;
var builder = WebApplication.CreateBuilder(args);


// Add Controllers
builder.Services.AddControllers();
builder.Services.AddEnyimMemcached(options =>
{
    options.AddServer(
        "127.0.0.1",
        11211
    );
});
builder.Services.AddScoped<CacheService>();
// Register Services
builder.Services.AddScoped<UserService>();


// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Database Connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));


var app = builder.Build();


// Configure HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthorization();


// Map Controllers
app.MapControllers();


app.Run();