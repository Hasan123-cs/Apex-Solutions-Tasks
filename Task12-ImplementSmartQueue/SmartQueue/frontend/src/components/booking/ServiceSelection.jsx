
export default function ServiceSelection({
    services,
    selectedService,
    onSelect,
}) {
    if (services.length === 0) {
        return (
            <p className="booking-empty">
                No active services are available.
            </p>
        );
    }

    return (
        <div className="booking-options">
            {services.map((service) => (
                <button
                    key={service.id}
                    type="button"
                    className={`booking-option ${selectedService?.id === service.id
                        ? "selected"
                        : ""
                        }`}
                    onClick={() => onSelect(service)}
                >
                    <span className="option-icon">✦</span>

                    <span className="option-details">
                        <strong>{service.name}</strong>
                        <small>
                            {service.description ||
                                "Professional appointment service"}
                        </small>
                        <small>
                            {service.durationMinutes ??
                                service.duration ??
                                "—"}{" "}
                            minutes
                        </small>
                    </span>
                    <span className="service-price">
                        ${Number(service.price).toFixed(2)}
                    </span>
                    <span className="option-check">
                        {selectedService?.id === service.id
                            ? "✓"
                            : "○"}
                    </span>
                </button>
            ))}
        </div>
    );
}
