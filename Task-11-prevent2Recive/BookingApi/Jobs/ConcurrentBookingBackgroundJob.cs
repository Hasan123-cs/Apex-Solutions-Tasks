
using System.Net.Http.Json;

namespace BookingApi.Jobs;

public class ConcurrentBookingBackgroundJob
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ConcurrentBookingBackgroundJob> _logger;

    public ConcurrentBookingBackgroundJob(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ConcurrentBookingBackgroundJob> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task RunAsync()
    {
        var baseUrl = _configuration["BookingApiBaseUrl"]
            ?? throw new InvalidOperationException(
                "BookingApiBaseUrl is missing.");

        var client = _httpClientFactory.CreateClient();

        var date = new DateTime(2026, 10, 17);

        // 1. Create the initial booking at 10:00 AM.
        var initialBooking = new
        {
            RoomId = 101,
            BookingDate = date.AddHours(10),
            UserId = "user-initial"
        };

        var initialResponse = await client.PostAsJsonAsync(
            $"{baseUrl}/api/bookings",
            initialBooking);

        _logger.LogInformation(
            "10 AM booking returned HTTP {StatusCode}",
            (int)initialResponse.StatusCode);

        if (!initialResponse.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Initial 10 AM booking failed. " +
                "The concurrency test was not run.");
        }

        // 2. Prepare two different users for 11:00 AM.
        var bookingA = new
        {
            RoomId = 101,
            BookingDate = date.AddHours(11),
            UserId = "user-A"
        };

        var bookingB = new
        {
            RoomId = 101,
            BookingDate = date.AddHours(11),
            UserId = "user-B"
        };

        // 3. Start both HTTP requests before awaiting either.
        var taskA = client.PostAsJsonAsync(
            $"{baseUrl}/api/bookings", bookingA);

        var taskB = client.PostAsJsonAsync(
            $"{baseUrl}/api/bookings", bookingB);

        var responses = await Task.WhenAll(taskA, taskB);

        foreach (var response in responses)
        {
            var body = await response.Content.ReadAsStringAsync();

            _logger.LogInformation(
                "HTTP {StatusCode}: {Body}",
                (int)response.StatusCode,
                body);
        }

        var succeeded = responses.Count(
            r => (int)r.StatusCode == 201);

        var conflicted = responses.Count(
            r => (int)r.StatusCode == 409);

        _logger.LogInformation(
            "Test result: {Succeeded} succeeded; " +
            "{Conflicted} conflicted.",
            succeeded,
            conflicted);

        if (succeeded != 1 || conflicted != 1)
        {
            throw new InvalidOperationException(
                "Expected one successful booking and one conflict.");
        }
    }
}
