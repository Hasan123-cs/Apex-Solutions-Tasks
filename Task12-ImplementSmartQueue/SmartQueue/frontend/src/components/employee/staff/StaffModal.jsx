
import { useState } from "react";

const INITIAL_FORM = {
    fullName: "",
    email: "",
    password: "",
    role: "Staff",
};

export default function StaffModal({
    onClose,
    onSave,
    saving = false,
}) {
    const [form, setForm] = useState(INITIAL_FORM);
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

        if (!form.fullName.trim()) {
            setError("Full name is required.");
            return;
        }

        if (!form.email.trim()) {
            setError("Email is required.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (!["Staff", "Receptionist"].includes(form.role)) {
            setError("Invalid role.");
            return;
        }

        try {
            setError("");

            await onSave({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create staff account."
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
                aria-labelledby="staff-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="staff-modal-header">
                    <div>
                        <h2 id="staff-modal-title">Add staff member</h2>
                        <p>Create a new employee account</p>
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
                        <label htmlFor="staff-full-name">Full name</label>

                        <input
                            id="staff-full-name"
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="staff-form-group">
                        <label htmlFor="staff-email">Email</label>

                        <input
                            id="staff-email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="employee@example.com"
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="staff-form-group">
                        <label htmlFor="staff-password">
                            Temporary password
                        </label>

                        <input
                            id="staff-password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            autoComplete="new-password"
                            required
                            disabled={saving}
                        />
                    </div>

                    <div className="staff-form-group">
                        <label htmlFor="staff-role">Role</label>

                        <select
                            id="staff-role"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            disabled={saving}
                        >
                            <option value="Staff">Staff</option>
                            <option value="Receptionist">Receptionist</option>
                        </select>
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
                            {saving ? "Creating..." : "Create account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
