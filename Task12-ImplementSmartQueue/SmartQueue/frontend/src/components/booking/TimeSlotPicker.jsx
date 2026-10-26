
export default function TimeSlotPicker({
    slots,
    selectedTime,
    onSelectTime,
    loading,
}) {
    if (loading) {
        return (
            <p className="booking-empty">
                Loading available times...
            </p>
        );
    }

    if (slots.length === 0) {
        return (
            <p className="booking-empty">
                No available time slots for this date.
            </p>
        );
    }

    return (
        <div className="time-picker">
            <h3>Available times</h3>

            <div className="time-grid">
                {slots.map((slot) => {
                    const time =
                        typeof slot === "string"
                            ? slot
                            : slot.startTime ?? slot.time;

                    const available =
                        typeof slot === "string"
                            ? true
                            : slot.isAvailable ??
                            slot.available ??
                            true;

                    return (
                        <button
                            key={time}
                            type="button"
                            disabled={!available}
                            className={`time-slot ${selectedTime === time
                                    ? "selected"
                                    : ""
                                }`}
                            onClick={() => onSelectTime(time)}
                        >
                            {time}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
