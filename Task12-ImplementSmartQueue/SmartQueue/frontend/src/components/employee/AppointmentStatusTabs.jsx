
const statuses = [
    { value: "All", label: "All" },
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "CheckedIn", label: "Checked In" },
    { value: "InProgress", label: "In Service" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "NoShow", label: "No-show" },
];

export default function AppointmentStatusTabs({
    appointments,
    activeStatus,
    onStatusChange,
}) {
    return (
        <div className="employee-status-tabs">
            {statuses.map((status) => {
                const count =
                    status.value === "All"
                        ? appointments.length
                        : appointments.filter(
                            (appointment) =>
                                appointment.status === status.value
                        ).length;

                return (
                    <button
                        key={status.value}
                        type="button"
                        className={
                            activeStatus === status.value
                                ? "employee-status-tab active"
                                : "employee-status-tab"
                        }
                        onClick={() => onStatusChange(status.value)}
                    >
                        {status.label}
                        <span>{count}</span>
                    </button>
                );
            })}
        </div>
    );
}
