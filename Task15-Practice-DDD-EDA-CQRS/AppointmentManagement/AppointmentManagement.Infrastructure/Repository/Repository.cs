using AppointmentManagement.Domain.Entity;
using AppointmentManagement.Domain.Repository;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Infrastructure.Repository
{
    internal class Repository : IRepository
    {
         // db ..
        public Task AddAsync(Appointment appointment, CancellationToken t)
        {
            // write logic of each 
          throw new NotImplementedException();
        }

        public Task<Appointment> GetAppointmentById(Guid appointmentId, CancellationToken t)
        {
            throw new NotImplementedException();
        }

        public Task SaveChangeAsync(CancellationToken t)
        {
            throw new NotImplementedException();
        }
    }
}
