using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Application.Appointments.Commands
{
    public  record CompleteAppointmentCommand(Guid AppointmentId) : IRequest
    {
    }
}
