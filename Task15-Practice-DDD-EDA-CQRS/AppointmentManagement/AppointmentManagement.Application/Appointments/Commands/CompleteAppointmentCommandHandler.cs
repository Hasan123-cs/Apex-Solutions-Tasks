using AppointmentManagement.Application.Events;
using AppointmentManagement.Domain.Repository;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace AppointmentManagement.Application.Appointments.Commands
{
    public class CompleteAppointmentCommandHandler : IRequestHandler<CompleteAppointmentCommand>
    {
        public IRepository _rep { get; set; }
        public IDomainEventDispatcher _dis { get; set; }
        public CompleteAppointmentCommandHandler(IRepository rep, IDomainEventDispatcher dis)
        {
            _rep = rep;
            _dis = dis;
        }
        public async Task Handle(CompleteAppointmentCommand request, CancellationToken cancellationToken)
        {
            var app = await _rep.GetAppointmentById(request.AppointmentId, cancellationToken);
            app.CompleteAppointment();
            await _rep.SaveChangeAsync(cancellationToken);
            var events = app.DomainEvents.ToList();
            await  _dis.DispatchAsync(events, cancellationToken);
        }
    }
}
