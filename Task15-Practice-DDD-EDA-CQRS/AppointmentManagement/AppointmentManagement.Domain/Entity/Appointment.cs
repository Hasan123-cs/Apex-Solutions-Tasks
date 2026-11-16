using AppointmentManagement.Domain.Common;
using AppointmentManagement.Domain.Enums;
using AppointmentManagement.Domain.Events;
using System;
using System.Collections.Generic;
using System.Text;
// supose we create the common entity aggregate root and value object here we practice at cqrs and EDA more than DDD 

namespace AppointmentManagement.Domain.Entity
{
    public class Appointment : BaseEntity
    {
        public Guid Id { get; private set; }
        public string PatientName { get; private set; }
        public string PatientEmail { get; private set; }
        public DateTime AppointmentDate { get; private set; }
        public AppointmentStatus Status { get; private set; }

        public Appointment(Guid id, string patientName, string patientEmail, DateTime appointmentDate)
        {
            Id = id;
            PatientName = patientName;
            PatientEmail = patientEmail;
            AppointmentDate = appointmentDate;
            Status = AppointmentStatus.Pending;
            AddDomainEvent(new AppointmentCreatedEvent(Id, PatientEmail));
        
        }

        public void CompleteAppointment()
        {
            if(Status!=AppointmentStatus.Pending)
            {
                throw new InvalidOperationException("Only pending appointments can be completed.");
            }

            Status = AppointmentStatus.Completed;
            AddDomainEvent(new AppointmentCompletedEvent(Id, PatientEmail));
        }

    }
}
