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
    Task<List<StaffAppointmentDto>> GetStaffAppointmentsAsync(
    string userId,
    bool canViewAll,
    DateOnly date);

    Task ConfirmAppointmentAsync(int appointmentId);
    Task CancelAppointmentByStaffAsync(
    int appointmentId,
    string staffUserId);

Task<int> CheckInAppointmentAsync(string reference);


Task RescheduleAppointmentByStaffAsync(
    int appointmentId,
    RescheduleAppointmentDto dto);

Task MarkNoShowAsync(int appointmentId);

}