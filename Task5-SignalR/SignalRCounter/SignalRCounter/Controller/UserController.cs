using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SignalRCounter.Data;

namespace SignalRCounter.Controller
{
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

            var users = await _context.Users
                .OrderByDescending(x => x.Id)
                .ToListAsync();


            return Ok(users);

        }
    }
}
