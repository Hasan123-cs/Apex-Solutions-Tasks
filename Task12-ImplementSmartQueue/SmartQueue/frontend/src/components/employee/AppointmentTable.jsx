
import AppointmentActions from "./AppointmentActions";

const statusLabels = {
    Pending: "Pending",
    Confirmed: "Confirmed",
    CheckedIn: "Checked In",
    InProgress: "In Service",
    Completed: "Completed",
    Cancelled: "Cancelled",
    NoShow: "No-show",
};

function formatTime(value) {
    if (!value) return "—";

    return new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export default function AppointmentTable({
    appointments,
    role,
    onAction,
}) {
    return (
        <div className="employee-table-wrapper">
            <table className="employee-appointments-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Reference</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Staff</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                            <td>
                                {formatTime(appointment.start)}
                                {" - "}
                                {formatTime(appointment.end)}
                            </td>

                            <td>
                                <strong>{appointment.reference}</strong>
                            </td>

                            <td>{appointment.customerName}</td>

                            <td>{appointment.serviceName}</td>

                            <td>{appointment.staffName}</td>

                            <td>
                                <span
                                    className={`employee-appointment-status ${appointment.status.toLowerCase()}`}
                                >
                                    {statusLabels[appointment.status] ||
                                        appointment.status}
                                </span>
                            </td>

                            <td>
                                <AppointmentActions
                                    appointment={appointment}
                                    role={role}
                                    onAction={onAction}
                                />
                            </td>
                        </tr>
                    ))}

                    {appointments.length === 0 && (
                        <tr>
                            <td
                                colSpan={7}
                                className="employee-empty-row"
                            >
                                No appointments found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
