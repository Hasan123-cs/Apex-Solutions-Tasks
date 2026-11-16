using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Domain.Events
{
    public  record AppointmentCompletedEvent(
    Guid AppointmentId,
    string PatientEmail
) : IDomainEvent
    {
        public DateTime OccurredOnUtc { get; } = DateTime.UtcNow;
    }
}
