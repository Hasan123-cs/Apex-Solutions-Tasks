
import { useEffect, useRef } from "react";

export default function AppointmentFilters({
    search,
    onSearchChange,
    date,
    onDateChange,
    staffId,
    onStaffChange,
    staffOptions,
    canViewAll,
}) {
    const searchRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const target = event.target;

            const isTyping =
                target instanceof HTMLElement &&
                (target.isContentEditable ||
                    ["INPUT", "TEXTAREA", "SELECT"].includes(
                        target.tagName
                    ));

            // Press "/" to focus search
            if (event.key === "/" && !isTyping) {
                event.preventDefault();
                searchRef.current?.focus();
            }

            // Press Escape to leave search
            if (
                event.key === "Escape" &&
                document.activeElement === searchRef.current
            ) {
                searchRef.current?.blur();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="employee-appointment-filters">
            <div className="employee-search-box">
                <span className="employee-search-icon" aria-hidden="true">
                    ⌕
                </span>

                <input
                    ref={searchRef}
                    type="search"
                    placeholder="Search reference or customer..."
                    aria-label="Search appointments"
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                />

                <kbd>/</kbd>
            </div>

            <div className="employee-filter-field">
                <label htmlFor="employee-appointment-date">
                    Date
                </label>

                <input
                    id="employee-appointment-date"
                    type="date"
                    value={date}
                    onChange={(event) =>
                        onDateChange(event.target.value)
                    }
                />
            </div>

            {canViewAll && (
                <div className="employee-filter-field">
                    <label htmlFor="employee-appointment-staff">
                        Staff
                    </label>

                    <select
                        id="employee-appointment-staff"
                        value={staffId}
                        onChange={(event) =>
                            onStaffChange(event.target.value)
                        }
                    >
                        <option value="All">All staff</option>

                        {staffOptions.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                                {staff.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
