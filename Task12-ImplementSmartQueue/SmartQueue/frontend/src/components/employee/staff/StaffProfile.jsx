export default function StaffProfile({ member, onEdit }) {
    if (!member) return null;

    const initials = (member.fullName || member.email || "?")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <section className="staff-profile-card">
            <div className="staff-profile-avatar">
                {initials}
            </div>

            <div className="staff-profile-details">
                <h2>{member.fullName || member.email}</h2>
                <p>{member.email}</p>
                <span className="staff-profile-role">
                    {member.role}
                </span>
            </div>

            <button
                type="button"
                className="staff-edit-account-btn"
                onClick={onEdit}
            >
                ✎ Edit account
            </button>
        </section>
    );
}