
import { Pencil } from "lucide-react";

function formatDate(value) {
    if (!value) return "—";

    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Beirut"
    }).format(new Date(value));
}

export default function ServicesTable({
    services,
    loading,
    updatingId,
    onEdit,
    onToggle
}) {
    return (
        <div className="services-table-wrapper">
            <table className="services-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Duration</th>
                        <th>Price</th>
                        <th>Active</th>
                        <th>Created</th>
                        <th aria-label="Actions"></th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <tr key={index}>
                                {Array.from({ length: 6 }).map((_, col) => (
                                    <td key={col}>
                                        <div className="services-skeleton" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : services.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="services-empty">
                                No services found.
                            </td>
                        </tr>
                    ) : (
                        services.map(service => (
                            <tr
                                key={service.id}
                                className={!service.isActive ? "inactive-row" : ""}
                            >
                                <td>
                                    <div className="services-name">
                                        {service.name}
                                    </div>
                                    <div className="services-description">
                                        {service.description || "—"}
                                    </div>
                                </td>

                                <td>{service.durationMinutes} min</td>

                                <td>
                                    ${Number(service.price).toFixed(2)}
                                </td>

                                <td>
                                    <div className="services-status-cell">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={service.isActive}
                                            aria-label={`Toggle ${service.name}`}
                                            disabled={updatingId === service.id}
                                            className={`services-status-switch ${service.isActive ? "on" : ""
                                                }`}
                                            onClick={() => onToggle(service)}
                                        >
                                            <span />
                                        </button>
                                        <span>
                                            {service.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </td>

                                <td>{formatDate(service.createdAt)}</td>

                                <td>
                                    <button
                                        type="button"
                                        className="services-edit-button"
                                        aria-label={`Edit ${service.name}`}
                                        onClick={() => onEdit(service)}
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
