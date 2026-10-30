using System.ComponentModel.DataAnnotations;

namespace SmartQueue.Application.DTOs.Services;

public class SaveServiceDto
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Duration must be positive.")]
    public int DurationMinutes { get; set; }

    [Range(typeof(decimal), "0", "999999999", ErrorMessage = "Price cannot be negative.")]
    public decimal Price { get; set; }
}