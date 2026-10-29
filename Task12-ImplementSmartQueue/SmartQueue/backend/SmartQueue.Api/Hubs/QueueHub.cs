
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SmartQueue.Api.Hubs;

[Authorize(Roles = "Admin,Receptionist,Staff")]
public class QueueHub : Hub
{
}
