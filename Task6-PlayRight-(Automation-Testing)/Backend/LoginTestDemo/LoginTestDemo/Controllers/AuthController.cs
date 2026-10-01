using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace LoginTestDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("login-policy")]
    public class AuthController : ControllerBase
    {

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {

            if (request.Username == "admin"
                && request.Password == "123456")
            {
                return Ok(new
                {
                    message = "Login successful",
                    username = "Admin"
                });
            }


            return Unauthorized(new
            {
                message = "Invalid username or password"
            });

        }
    }


    public class LoginRequest
    {
        public string Username { get; set; }

        public string Password { get; set; }
    }
}
