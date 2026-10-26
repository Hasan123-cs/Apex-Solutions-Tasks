
export default function BookingSummary({
    service,
    staff,
    date,
    time,
    currentStep,
    onContinue,
    onBack,
    loading,
    disabled,
}) {
    const formattedDate = date
        ? new Date(`${date}T12:00:00`).toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        )
        : "Not selected";

    return (
        <aside className="booking-summary">
            <h3>Your booking</h3>
            {/* <div */}
            <div className="summary-row"  >
                <span>Service</span>
                <strong>
                    {service?.name || "Not selected"}
                </strong>
                <br></br>

                <span style={{ color: "#6c757d", fontSize: "13px" }}>
                    {service
                        ? `$${Number(service.price).toFixed(2)}`
                        : "—"}

                </span>

            </div>
            {/* </div> */}
            <div className="summary-row">
                <span>With</span>
                <strong>
                    {staff?.fullName ||
                        staff?.name ||
                        "Not selected"}
                </strong>
            </div>

            <div className="summary-row">
                <span>Date</span>
                <strong>{formattedDate}</strong>
            </div>

            <div className="summary-row">
                <span>Time</span>
                <strong>
                    {time || "Not selected"}
                </strong>
            </div>

            <div className="summary-actions">
                {currentStep > 0 && (
                    <button
                        type="button"
                        className="booking-back"
                        onClick={onBack}
                        disabled={loading}
                    >
                        Back
                    </button>
                )}

                <button
                    type="button"
                    className="booking-continue"
                    onClick={onContinue}
                    disabled={disabled || loading}
                >
                    {loading
                        ? "Please wait..."
                        : currentStep === 3
                            ? "Confirm booking"
                            : "Continue →"}
                </button>
            </div>

            <div className="booking-info">
                <span>ⓘ</span>
                <p>
                    Availability is checked again when
                    you confirm your booking.
                </p>
            </div>
        </aside>
    );
}
