using Microsoft.AspNetCore.SignalR;
using SignalRCounter.Data;
using SignalRCounter.Hubs;
using SignalRCounter.Models;

namespace SignalRCounter.Background
{
    public class UserCreationBackgroundService
    : BackgroundService
    {

        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<UserHub> _hub;

        public UserCreationBackgroundService(
            IServiceProvider serviceProvider,
            IHubContext<UserHub> hub)
        {
            _serviceProvider = serviceProvider;
            _hub = hub;
        }



        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {

            while (!stoppingToken.IsCancellationRequested)
            {

                using (var scope = _serviceProvider.CreateScope())
                {

                    var db =
                    scope.ServiceProvider
                    .GetRequiredService<AppDbContext>();


                    var user = new User
                    {
                        Name = "User " + DateTime.Now.Ticks,
                        CreatedAt = DateTime.Now
                    };


                    db.Users.Add(user);


                    await db.SaveChangesAsync();


                    Console.WriteLine(
                    "User Added : " + user.Name);

                  await _hub.Clients.All.SendAsync(
                    "ReceiveUser",
                    user
                );

                }

              

                await Task.Delay(
                    TimeSpan.FromSeconds(30),
                    stoppingToken
                );

            }

        }

    }
}
