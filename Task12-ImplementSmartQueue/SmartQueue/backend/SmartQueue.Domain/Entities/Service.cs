using SmartQueue.Domain.Common;

namespace SmartQueue.Domain.Entities;

public class Service : AggregateRoot<int>
{
    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public int Duration { get; private set; }

    public decimal Price { get; private set; }

    public bool Active { get; private set; } = true;

    public DateTime CreatedAt { get; private set; }

    public ICollection<Appointment> Appointments { get; set; }
        = new List<Appointment>();

    public ICollection<StaffScheduleService> StaffScheduleServices { get; set; }
        = new List<StaffScheduleService>();

    // Required by EF Core
    private Service() { }

    public Service(
        string name,
        string? description,
        int duration,
        decimal price)
    {
        UpdateDetails(name, description, duration, price);

        Active = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        string name,
        string? description,
        int duration,
        decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException(
                "Service name is required.");

        if (duration <= 0)
            throw new ArgumentException(
                "Service duration must be greater than zero.");

        if (price < 0)
            throw new ArgumentException(
                "Service price cannot be negative.");

        Name = name.Trim();
        Description = description?.Trim();
        Duration = duration;
        Price = price;
    }

    public void SetActive(bool isActive)
    {
        Active = isActive;
    }
}