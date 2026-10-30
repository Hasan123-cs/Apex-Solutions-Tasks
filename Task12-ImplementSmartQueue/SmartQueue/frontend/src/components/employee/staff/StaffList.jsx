
const avatarColors = [
    "#DDEFEA",
    "#E8E3FA",
    "#FBE8DA",
    "#DBEAF8",
    "#F6E2EC",
];

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
}

export default function StaffList({
    staff,
    selectedStaffId,
    onSelect,
    search,
    onSearchChange,
    loading,
}) {
    const filteredStaff = staff.filter((member) => {
        const query = search.trim().toLowerCase();

        return (
            member.fullName?.toLowerCase().includes(query) ||
            member.email?.toLowerCase().includes(query) ||
            member.role?.toLowerCase().includes(query)
        );
    });

    return (
        <section className="staff-list-panel">
            <div className="staff-list-header">
                <div>
                    <h2>Team members</h2>
                    <p>{staff.length} members</p>
                </div>
            </div>

            <input
                className="staff-search-input"
                type="search"
                placeholder="Search staff..."
                value={search}
                onChange={(event) =>
                    onSearchChange(event.target.value)
                }
            />

            <div className="staff-members">
                {loading && <p>Loading staff members...</p>}

                {!loading && filteredStaff.length === 0 && (
                    <p className="staff-empty">
                        No staff members found.
                    </p>
                )}

                {!loading &&
                    filteredStaff.map((member, index) => (
                        <button
                            key={member.id}
                            type="button"
                            className={`staff-member-item ${selectedStaffId === member.id
                                ? "selected"
                                : ""
                                }`}
                            onClick={() => onSelect(member)}
                        >
                            <span
                                className="staff-member-avatar"
                                style={{
                                    backgroundColor:
                                        avatarColors[index % avatarColors.length],
                                }}
                            >
                                {getInitials(member.fullName)}
                            </span>

                            <span className="staff-member-info">
                                <strong>{member.fullName}</strong>
                                <small>{member.email}</small>
                            </span>

                            <span className="staff-member-role">
                                {member.role}
                            </span>
                        </button>
                    ))}
            </div>
        </section>
    );
}
