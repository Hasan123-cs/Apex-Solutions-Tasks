
import { useState } from "react";

const DAYS = [
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
    { value: 0, label: "Sun" },
];

const DEFAULT_INTERVAL = {
    from: "09:00:00",
    to: "17:00:00",
};

const toInputTime = (value) =>
    (value || "09:00:00").slice(0, 5);

const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

export default function WeeklySchedule({
    intervals = [],
    onChange,
    onSave,
    saving = false,
    hasChanges = false,
    disabled = false,
}) {
    const [error, setError] = useState("");

    const getDayIntervals = (day) =>
        intervals
            .filter((item) => item.dayOfWeek === day)
            .sort((a, b) => a.from.localeCompare(b.from));

    const toggleDay = (day) => {
        if (disabled) return;

        setError("");

        const existing = getDayIntervals(day);

        if (existing.length > 0) {
            onChange(
                intervals.filter((item) => item.dayOfWeek !== day)
            );
        } else {
            onChange([
                ...intervals,
                {
                    dayOfWeek: day,
                    ...DEFAULT_INTERVAL,
                },
            ]);
        }
    };

    const addInterval = (day) => {
        if (disabled) return;

        setError("");

        const dayIntervals = getDayIntervals(day);
        const last = dayIntervals[dayIntervals.length - 1];

        if (!last) return;

        const startMinutes = toMinutes(last.to);

        if (startMinutes >= 24 * 60 - 15) {
            setError("No more time available for this day.");
            return;
        }

        const endMinutes = Math.min(
            startMinutes + 60,
            24 * 60 - 1
        );

        const formatTime = (minutes) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            return `${String(hours).padStart(2, "0")}:${String(
                mins
            ).padStart(2, "0")}:00`;
        };

        onChange([
            ...intervals,
            {
                dayOfWeek: day,
                from: formatTime(startMinutes),
                to: formatTime(endMinutes),
            },
        ]);
    };

    const updateInterval = (original, field, value) => {
        if (disabled) return;

        setError("");

        const index = intervals.indexOf(original);

        if (index === -1) return;

        onChange(
            intervals.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [field]: `${value}:00`,
                    }
                    : item
            )
        );
    };

    const removeInterval = (original) => {
        if (disabled) return;

        setError("");

        onChange(
            intervals.filter((item) => item !== original)
        );
    };

    const validateSchedule = () => {
        for (const day of DAYS) {
            const dayIntervals = getDayIntervals(day.value);

            for (let i = 0; i < dayIntervals.length; i++) {
                const current = dayIntervals[i];

                if (current.from >= current.to) {
                    return `Invalid working hours on ${day.label}.`;
                }

                if (
                    i > 0 &&
                    current.from < dayIntervals[i - 1].to
                ) {
                    return `Working hours overlap on ${day.label}.`;
                }
            }
        }

        return "";
    };

    const handleSave = () => {
        if (disabled || saving || !hasChanges) return;

        const validationError = validateSchedule();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        onSave();
    };

    return (
        <section className="staff-weekly-card">
            <div className="staff-weekly-header">
                <div className="staff-weekly-title">
                    <h3>Weekly schedule</h3>

                    <span className="staff-weekly-timezone">
                        ◎ Asia/Beirut
                    </span>
                </div>

                <div className="staff-weekly-actions">
                    {hasChanges && (
                        <span className="staff-weekly-unsaved">
                            Unsaved changes
                        </span>
                    )}

                    <button
                        type="button"
                        className="staff-weekly-save"
                        onClick={handleSave}
                        disabled={disabled || saving || !hasChanges}
                    >
                        {saving ? "Saving..." : "Save schedule"}
                    </button>
                </div>
            </div>

            <div className="staff-weekly-body">
                <div className="staff-weekly-column-head">
                    <span />
                    <span />
                    <span>Working intervals</span>
                    <span />
                    <div className="staff-weekly-axis">
                        <span>08</span>
                        <span>11</span>
                        <span>14</span>
                        <span>17</span>
                        <span>20</span>
                    </div>
                </div>

                {DAYS.map((day) => {
                    const dayIntervals = getDayIntervals(day.value);
                    const working = dayIntervals.length > 0;

                    return (
                        <div
                            key={day.value}
                            className={`staff-weekly-row ${!working ? "day-off" : ""
                                }`}
                        >
                            <span className="staff-weekly-day">
                                {day.label}
                            </span>

                            <label className="staff-weekly-switch">
                                <input
                                    type="checkbox"
                                    checked={working}
                                    onChange={() => toggleDay(day.value)}
                                    disabled={disabled}
                                />

                                <span className="staff-weekly-slider" />
                            </label>

                            <div className="staff-weekly-intervals">
                                {working ? (
                                    dayIntervals.map((interval) => (
                                        <div
                                            key={`${day.value}-${interval.from}-${interval.to}`}
                                            className="staff-weekly-time-group"
                                        >
                                            <input
                                                type="time"
                                                value={toInputTime(interval.from)}
                                                onChange={(event) =>
                                                    updateInterval(
                                                        interval,
                                                        "from",
                                                        event.target.value
                                                    )
                                                }
                                                disabled={disabled}
                                                aria-label={`${day.label} start time`}
                                            />

                                            <span>–</span>

                                            <input
                                                type="time"
                                                value={toInputTime(interval.to)}
                                                onChange={(event) =>
                                                    updateInterval(
                                                        interval,
                                                        "to",
                                                        event.target.value
                                                    )
                                                }
                                                disabled={disabled}
                                                aria-label={`${day.label} end time`}
                                            />

                                            <button
                                                type="button"
                                                className="staff-weekly-remove"
                                                onClick={() => removeInterval(interval)}
                                                disabled={disabled}
                                                title="Remove interval"
                                                aria-label="Remove interval"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="staff-weekly-off-label">
                                        Day off
                                    </span>
                                )}
                            </div>

                            <div className="staff-weekly-add-area">
                                {working && (
                                    <button
                                        type="button"
                                        className="staff-weekly-add"
                                        onClick={() => addInterval(day.value)}
                                        disabled={disabled}
                                    >
                                        + Add
                                    </button>
                                )}
                            </div>

                            <div
                                className={`staff-weekly-timeline ${!working ? "inactive" : ""
                                    }`}
                            >
                                {working &&
                                    dayIntervals.map((interval, index) => {
                                        const from = toMinutes(interval.from);
                                        const to = toMinutes(interval.to);

                                        const start = Math.max(from, 8 * 60);
                                        const end = Math.min(to, 20 * 60);

                                        if (end <= start) return null;

                                        const left =
                                            ((start - 8 * 60) / (12 * 60)) * 100;

                                        const width =
                                            ((end - start) / (12 * 60)) * 100;

                                        return (
                                            <span
                                                key={index}
                                                className="staff-weekly-timeline-bar"
                                                style={{
                                                    left: `${left}%`,
                                                    width: `${width}%`,
                                                }}
                                            />
                                        );
                                    })}
                            </div>
                        </div>
                    );
                })}

                {error && (
                    <p className="staff-weekly-error" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}
