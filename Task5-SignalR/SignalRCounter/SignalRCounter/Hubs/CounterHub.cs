    using Microsoft.AspNetCore.SignalR;
namespace SignalRCounter.Hubs
{

    public class CounterHub : Hub
    {
        private readonly CounterService counter;
        public CounterHub(CounterService counter)
        {
            this.counter = counter;
        }
        public override async Task OnConnectedAsync()
        {
            counter.Count++;
            await Clients.All.SendAsync("ReceiveCount", counter.Count);
            await base.OnConnectedAsync();

        }
    }
}
