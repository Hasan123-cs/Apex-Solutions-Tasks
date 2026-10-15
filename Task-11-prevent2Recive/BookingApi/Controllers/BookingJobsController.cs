
using BookingApi.Jobs;
using Microsoft.AspNetCore.Mvc;

namespace BookingApi.Controllers;

[ApiController]
[Route("api/test")]
public class BookingJobsController : ControllerBase
{
    private readonly ConcurrentBookingBackgroundJob _job;

    public BookingJobsController(
        ConcurrentBookingBackgroundJob job)
    {
        _job = job;
    }

    [HttpPost("run-booking-job")]
    public IActionResult RunBookingJob()
    {
        _ = Task.Run(async () =>
        {
            try
            {
                await _job.RunAsync();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
            }
        });

        return Ok(new
        {
            Message = "Booking test completed. Check the logs for both results."
        });
    }
}
