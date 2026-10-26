
import { useState } from "react";

import { toLocalDateString } from "../../utils/dateUtils";

export default function BookingCalendar({
    selectedDate,
    onSelectDate,
}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewDate, setViewDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const monthLabel = viewDate.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric",
        }
    );

    const days = [
        ...Array(firstDay).fill(null),
        ...Array.from(
            { length: daysInMonth },
            (_, index) => index + 1
        ),
    ];

    function changeMonth(amount) {
        setViewDate(
            new Date(year, month + amount, 1)
        );
    }

    const currentMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const previousDisabled =
        viewDate.getTime() <= currentMonth.getTime();

    return (
        <div className="booking-calendar">
            <div className="calendar-header">
                <h3>{monthLabel}</h3>

                <div className="calendar-navigation">
                    <button
                        type="button"
                        disabled={previousDisabled}
                        onClick={() => changeMonth(-1)}
                    >
                        ‹
                    </button>

                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {[
                    "Su",
                    "Mo",
                    "Tu",
                    "We",
                    "Th",
                    "Fr",
                    "Sa",
                ].map((day) => (
                    <div
                        className="calendar-weekday"
                        key={day}
                    >
                        {day}
                    </div>
                ))}

                {days.map((day, index) => {
                    if (!day) {
                        return (
                            <div key={`empty-${index}`} />
                        );
                    }

                    const date = new Date(year, month, day);
                    const dateString =
                        toLocalDateString(date);

                    const isPast = date < today;
                    const isSelected =
                        selectedDate === dateString;

                    return (
                        <button
                            key={dateString}
                            type="button"
                            disabled={isPast}
                            onClick={() =>
                                onSelectDate(dateString)
                            }
                            className={`calendar-day ${isSelected ? "selected" : ""
                                }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
