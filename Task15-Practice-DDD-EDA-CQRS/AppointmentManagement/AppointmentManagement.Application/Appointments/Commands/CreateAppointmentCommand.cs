using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Application.Appointments.Commands
{
    public sealed record CreateAppointmentCommand(Guid id , DateTime scheduledTime, string patientEmail, string PatientName)  : IRequest<Guid>
    {
    }
}
