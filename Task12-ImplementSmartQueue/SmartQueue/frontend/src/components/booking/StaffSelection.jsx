
export default function StaffSelection({
    staff,
    selectedStaff,
    onSelect,
}) {
    if (staff.length === 0) {
        return (
            <p className="booking-empty">
                No staff members are available.
            </p>
        );
    }

    return (
        <div className="booking-options">
            {staff.map((member) => (
                <button
                    type="button"
                    key={member.id}
                    className={`booking-option ${selectedStaff?.id === member.id
                            ? "selected"
                            : ""
                        }`}
                    onClick={() => onSelect(member)}
                >
                    <span className="staff-avatar">
                        {(member.fullName || member.name || "S")
                            .charAt(0)
                            .toUpperCase()}
                    </span>

                    <span className="option-details">
                        <strong>
                            {member.fullName || member.name}
                        </strong>
                        <small>
                            {member.specialization ||
                                "Staff member"}
                        </small>
                    </span>

                    <span className="option-check">
                        {selectedStaff?.id === member.id
                            ? "✓"
                            : "○"}
                    </span>
                </button>
            ))}
        </div>
    );
}
