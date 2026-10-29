
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays } from "lucide-react";

const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function UpcomingAppointments({
    appointments = [],
    loading = false
}) {
    return (
        <section className="dashboard-panel dashboard-upcoming-panel">
            <div className="dashboard-panel-header">
                <div>
                    <h2>Coming up today</h2>
                    <p>Upcoming scheduled appointments</p>
                </div>

                <Link
                    to="/employee/appointments"
                    className="dashboard-panel-link"
                >
                    View all <ArrowUpRight size={15} />
                </Link>
            </div>

            <div className="dashboard-table-scroll">
                <table className="dashboard-upcoming-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Staff</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <tr key={index}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <td key={i}>
                                            <div className="dashboard-skeleton dashboard-table-skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="dashboard-empty">
                                    <CalendarDays size={20} />
                                    No upcoming appointments today.
                                </td>
                            </tr>
                        ) : (
                            appointments.map(item => (
                                <tr key={item.id}>
                                    <td className="dashboard-table-time">
                                        {formatTime(item.start)}
                                    </td>

                                    <td>
                                        <strong>{item.customerName}</strong>
                                        <small>{item.reference}</small>
                                    </td>

                                    <td>{item.serviceName}</td>
                                    <td>{item.staffName}</td>

                                    <td>
                                        <span className={`dashboard-status dashboard-status-${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
