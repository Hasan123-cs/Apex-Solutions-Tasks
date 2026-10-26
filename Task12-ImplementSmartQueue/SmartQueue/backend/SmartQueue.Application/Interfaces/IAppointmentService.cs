using SmartQueue.Application.DTOs.Appointments;

namespace SmartQueue.Application.Interfaces;

public interface IAppointmentService
{
    Task<AppointmentResponseDto> CreateAppointmentAsync(
        CreateAppointmentDto dto,
        string customerId);
    Task<List<MyAppointmentDto>> GetMyAppointmentsAsync(string customerId);

    Task CancelAppointmentAsync(int appointmentId, string customerId);
    Task RescheduleAppointmentAsync(
    int appointmentId,
    string customerId,
    RescheduleAppointmentDto dto);
}