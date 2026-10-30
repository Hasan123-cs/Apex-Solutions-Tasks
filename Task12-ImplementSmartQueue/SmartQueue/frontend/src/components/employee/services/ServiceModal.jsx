
import { useState } from "react";
import { X } from "lucide-react";

export default function ServiceModal({
    service,
    saving,
    onClose,
    onSave
}) {
    const [form, setForm] = useState({
        name: service?.name ?? "",
        description: service?.description ?? "",
        durationMinutes: service?.durationMinutes?.toString() ?? "",
        price: service?.price?.toString() ?? ""
    });

    const [error, setError] = useState("");

    const duration = Number(form.durationMinutes);
    const price = Number(form.price);

    const valid =
        form.name.trim().length > 0 &&
        form.name.trim().length <= 150 &&
        form.description.length <= 1000 &&
        form.durationMinutes.trim() !== "" &&
        Number.isInteger(duration) &&
        duration > 0 &&
        form.price.trim() !== "" &&
        Number.isFinite(price) &&
        price >= 0;

    function handleChange(field, value) {
        setForm(previous => ({
            ...previous,
            [field]: value
        }));

        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!valid || saving) return;

        try {
            await onSave({
                name: form.name.trim(),
                description: form.description.trim(),
                durationMinutes: duration,
                price
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to save service."
            );
        }
    }

    return (
        <div
            className="services-modal-overlay"
            onMouseDown={e => {
                if (e.target === e.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="services-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="service-modal-title"
            >
                <div className="services-modal-header">
                    <div>
                        <h2 id="service-modal-title">
                            {service ? "Edit service" : "New service"}
                        </h2>

                        <p>
                            {service
                                ? "Update the details of this service."
                                : "Add a new service for customers to book."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="services-modal-body">
                        <label>
                            Name
                            <input
                                type="text"
                                value={form.name}
                                onChange={e =>
                                    handleChange("name", e.target.value)
                                }
                                placeholder="e.g. General Consultation"
                                maxLength={150}
                                required
                            />
                        </label>

                        <label>
                            Description
                            <textarea
                                value={form.description}
                                onChange={e =>
                                    handleChange("description", e.target.value)
                                }
                                placeholder="Describe this service..."
                                rows={3}
                                maxLength={1000}
                            />
                        </label>

                        <div className="services-modal-grid">
                            <label>
                                Duration (minutes)
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={form.durationMinutes}
                                    onChange={e =>
                                        handleChange("durationMinutes", e.target.value)
                                    }
                                    placeholder="30"
                                    required
                                />
                            </label>

                            <label>
                                Price (USD)
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.price}
                                    onChange={e =>
                                        handleChange("price", e.target.value)
                                    }
                                    placeholder="25.00"
                                    required
                                />
                            </label>
                        </div>

                        {error && (
                            <p className="services-error" role="alert">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="services-modal-footer">
                        <button
                            type="button"
                            className="services-cancel-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="services-save-button"
                            disabled={!valid || saving}
                        >
                            {saving
                                ? "Saving..."
                                : service
                                    ? "Save changes"
                                    : "Create service"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
