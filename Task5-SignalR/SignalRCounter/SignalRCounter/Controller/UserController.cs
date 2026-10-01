using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SignalRCounter.Data;

namespace SignalRCounter.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController :ControllerBase
    {
        private readonly AppDbContext _context;


        public UserController(AppDbContext context)
        {
            _context = context;
        }



        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var random = Random.Shared.Next(1, 101);

            if (random <= 90)
            {
                return StatusCode(500, new
                {
                    message = "Random test error"
                });
            }

            var users = await _context.Users
                .OrderByDescending(x => x.Id)
                .ToListAsync();

            return Ok(users);
        }


    }
}
