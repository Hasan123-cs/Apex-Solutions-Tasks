using Microsoft.AspNetCore.Mvc;

namespace LoginTestDemo.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {


        [HttpGet]
        public IActionResult GetStudents()
        {

            return Ok(new
            {
                students = new[]
                {
                "Ali",
                "John"
            }
            });

        }
    }
}
