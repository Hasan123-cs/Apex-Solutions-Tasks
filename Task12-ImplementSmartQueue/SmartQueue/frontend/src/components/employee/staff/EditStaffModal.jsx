
import { useState } from "react";

export default function EditStaffModal({
    member,
    onClose,
    onSave,
    saving = false,
}) {
    const [form, setForm] = useState({
        fullName: member.fullName ?? "",
        email: member.email ?? "",
        role: member.role ?? "Staff",
        newPassword: "",
    });

    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.fullName.trim() || !form.email.trim()) {
            setError("Full name and email are required.");
            return;
        }

        if (
            form.newPassword &&
            form.newPassword.length < 8
        ) {
            setError("New password must be at least 8 characters.");
            return;
        }

        try {
            setError("");

            await onSave({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                role: form.role,
                newPassword: form.newPassword || null,
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update employee account."
            );
        }
    };

    return (
        <div
            className="staff-modal-overlay"
            onClick={() => {
                if (!saving) onClose();
            }}
        >
            <div
                className="staff-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-staff-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="staff-modal-header">
                    <div>
                        <h2 id="edit-staff-title">Edit account</h2>
                        <p>Update employee account details</p>
                    </div>

                    <button
                        type="button"
                        className="staff-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="staff-form-group">
                        <label htmlFor="edit-staff-name">Full name</label>
                        <input
                            id="edit-staff-name"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="staff-form-group">
                        <label htmlFor="edit-staff-email">Email</label>
                        <input
                            id="edit-staff-email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="staff-form-group">
                        <label htmlFor="edit-staff-role">Role</label>
                        <select
                            id="edit-staff-role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            disabled={saving}
                        >
                            <option value="Staff">Staff</option>
                            <option value="Receptionist">Receptionist</option>
                        </select>
                    </div>

                    <div className="staff-form-group">
                        <label htmlFor="edit-staff-password">
                            New password (optional)
                        </label>
                        <input
                            id="edit-staff-password"
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            placeholder="Leave blank to keep current password"
                            disabled={saving}
                        />
                    </div>

                    {error && (
                        <p className="staff-form-error" role="alert">
                            {error}
                        </p>
                    )}

                    <div className="staff-modal-actions">
                        <button
                            type="button"
                            className="staff-secondary-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="staff-primary-btn"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
