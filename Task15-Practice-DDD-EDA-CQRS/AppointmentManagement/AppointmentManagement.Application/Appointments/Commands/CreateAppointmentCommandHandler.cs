using AppointmentManagement.Application.Events;
using AppointmentManagement.Domain.Entity;
using AppointmentManagement.Domain.Repository;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Application.Appointments.Commands
{
    public class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, Guid>
    {
        public IDomainEventDispatcher _dispatcher { get; set; }
        public IRepository _repository { get;  }
        public CreateAppointmentCommandHandler(IRepository s , IDomainEventDispatcher dispatcher)
         {
            _repository = s;
            _dispatcher = dispatcher;
        }
        public async Task<Guid> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            var appointment = new Appointment(request.id, request.patientEmail,request.PatientName ,request.scheduledTime);
            await _repository.AddAsync(appointment, cancellationToken);
            await _repository.SaveChangeAsync(cancellationToken);

            var events = appointment.DomainEvents.ToList();
                await _dispatcher.DispatchAsync(events, cancellationToken);
            appointment.ClearDomainEvents();
          return appointment.Id;
        }
    }
}
