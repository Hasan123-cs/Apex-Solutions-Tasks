
export default function QualifiedServices({
    services = [],
    selectedServiceIds = [],
    onChange,
    disabled = false,
}) {
    const toggleService = (serviceId) => {
        if (disabled) return;

        const selected = selectedServiceIds.includes(serviceId);

        onChange(
            selected
                ? selectedServiceIds.filter((id) => id !== serviceId)
                : [...selectedServiceIds, serviceId]
        );
    };

    return (
        <section className="staff-services-card">
            <div className="staff-section-header">
                <div>
                    <h3>Qualified services</h3>
                    <p>Select services this employee can provide</p>
                </div>
            </div>

            <div className="staff-qualified-services">
                {services.map((service) => {
                    const active = service.isActive ?? service.active ?? false;

                    const duration =
                        service.durationMinutes ?? service.duration;

                    const selected = selectedServiceIds.includes(service.id);

                    return (
                        <label
                            key={service.id}
                            className={`staff-service-option ${!active ? "inactive" : ""
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selected}
                                disabled={disabled || !active}
                                onChange={() => toggleService(service.id)}
                            />

                            <span className="staff-service-details">
                                <strong>{service.name}</strong>

                                <small>
                                    {duration != null ? `${duration} min` : "Duration unavailable"}
                                    {!active && " · Inactive"}
                                </small>
                            </span>
                        </label>
                    );
                })}
            </div>
        </section>
    );
}
