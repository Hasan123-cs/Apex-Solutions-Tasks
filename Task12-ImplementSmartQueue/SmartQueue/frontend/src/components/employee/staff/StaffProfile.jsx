
function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
}

export default function StaffProfile({ member }) {
    if (!member) {
        return (
            <section className="staff-profile-card">
                <p>Select a staff member to view their profile.</p>
            </section>
        );
    }

    return (
        <section className="staff-profile-card">
            <div className="staff-profile-avatar">
                {getInitials(member.fullName)}
            </div>

            <div className="staff-profile-details">
                <h2>{member.fullName}</h2>
                <p>{member.email}</p>
                <span className="staff-profile-role">
                    {member.role}
                </span>
            </div>
        </section>
    );
}
