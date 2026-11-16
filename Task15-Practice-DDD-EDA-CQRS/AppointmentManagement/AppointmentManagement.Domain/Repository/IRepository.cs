using AppointmentManagement.Domain.Entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Domain.Repository
{
    public  interface IRepository
    {
        public Task AddAsync(Appointment appointment, CancellationToken t);
        public Task SaveChangeAsync(CancellationToken t);
        public Task<Appointment> GetAppointmentById(Guid appointmentId, CancellationToken t);
    }
}
