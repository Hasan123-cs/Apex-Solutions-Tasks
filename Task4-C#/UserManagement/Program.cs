using Enyim.Caching;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UserManagement.Data;
using UserManagement.Services;
var builder = WebApplication.CreateBuilder(args);
builder.Services
.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,

            ValidateAudience = true,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,


            ValidIssuer =
            builder.Configuration["Jwt:Issuer"],


            ValidAudience =
            builder.Configuration["Jwt:Audience"],


            IssuerSigningKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                builder.Configuration["Jwt:Key"]!
                ))
        };
});

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

app.UseAuthentication();

app.UseAuthorization();


// Map Controllers
app.MapControllers();


app.Run();