using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddRateLimiter(options =>
{

    options.AddFixedWindowLimiter(
        policyName: "login-policy",
        options =>
        {
            options.PermitLimit = 5;

            options.Window =
                TimeSpan.FromMinutes(1);

            options.QueueLimit = 0;
        });


    options.RejectionStatusCode = 429;

});



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();

app.UseDefaultFiles();

app.UseStaticFiles();

app.UseRateLimiter();

app.MapControllers();
app.Run();

