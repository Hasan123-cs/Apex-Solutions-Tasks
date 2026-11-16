using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Domain.Events
{
    public  interface IDomainEvent
    {
        DateTime OccurredOnUtc { get; }
    }
}
