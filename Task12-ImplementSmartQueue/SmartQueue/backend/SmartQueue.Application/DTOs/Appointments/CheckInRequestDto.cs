using System.ComponentModel.DataAnnotations;

namespace SmartQueue.Application.DTOs.Appointments;

public class CheckInRequestDto
{
    [Required]
    public string Reference { get; set; } = string.Empty;
}