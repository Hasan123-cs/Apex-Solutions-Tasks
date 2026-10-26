
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/MyAppointments.css";

export default function MyAppointments() {
    const navigate = useNavigate();
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rescheduleId, setRescheduleId] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [rescheduling, setRescheduling] = useState(false);
    const [rescheduleError, setRescheduleError] = useState("");


    function openReschedule(appointment) {
        setRescheduleId(
            rescheduleId === appointment.id ? null : appointment.id
        );

        setNewDate("");
        setNewTime("");
        setAvailableSlots([]);
        setRescheduleError("");
    }
    async function handleCancelAppointment() {
        if (!cancelTarget || cancelling) return;

        setCancelling(true);
        setCancelError("");

        try {
            await api.patch(
                `/api/appointments/${cancelTarget.id}/cancel`
            );

            setAppointments((current) =>
                current.map((appointment) =>
                    appointment.id === cancelTarget.id
                        ? { ...appointment, status: "Cancelled" }
                        : appointment
                )
            );

            setCancelTarget(null);
        } catch (err) {
            setCancelError(
                err.response?.data?.message ||
                "Could not cancel appointment."
            );
        } finally {
            setCancelling(false);
        }
    }



    useEffect(() => {
        if (!rescheduleId || !newDate) return;

        const appointment = appointments.find(
            (a) => a.id === rescheduleId
        );

        if (!appointment) return;

        let active = true;

        async function loadSlots() {
            setLoadingSlots(true);
            setRescheduleError("");
            setAvailableSlots([]);

            try {
                const response = await api.get(
                    "/api/appointments/availability",
                    {
                        params: {
                            serviceId: appointment.serviceId,
                            staffId: appointment.staffId,
                            date: newDate,
                        },
                    }
                );

                if (active) {
                    setAvailableSlots(response.data.slots || []);
                }
            } catch (err) {
                if (active) {
                    setRescheduleError(
                        "Could not load available times." + err
                    );
                }
            } finally {
                if (active) setLoadingSlots(false);
            }
        }

        loadSlots();

        return () => {
            active = false;
        };
    }, [rescheduleId, newDate, appointments]);


    useEffect(() => {
        let active = true;

        async function loadAppointments() {
            try {
                const response = await api.get("/api/appointments/my");

                if (active) {
                    setAppointments(response.data);
                    setError("");
                }
            } catch (err) {
                console.error(err);
                if (active) {
                    setError("Could not load your appointments.");
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadAppointments();

        // Refresh statuses every 15 seconds
        const interval = setInterval(loadAppointments, 15000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);


    async function handleConfirmReschedule() {
        if (!rescheduleId || !newDate || !newTime || rescheduling)
            return;

        setRescheduling(true);
        setRescheduleError("");

        try {
            await api.patch(
                `/api/appointments/${rescheduleId}/reschedule`,
                {
                    date: newDate,
                    startTime: newTime,
                }
            );

            // Reload from backend to get updated start/end/status
            const response = await api.get("/api/appointments/my");

            setAppointments(response.data);

            setRescheduleId(null);
            setNewDate("");
            setNewTime("");
            setAvailableSlots([]);
        } catch (err) {
            setRescheduleError(
                err.response?.data?.message ||
                "Could not reschedule appointment."
            );
        } finally {
            setRescheduling(false);
        }
    }
    const now = new Date();

    const upcoming = appointments
        .filter((a) =>
            new Date(a.end) >= now &&
            !["Cancelled", "Completed"].includes(a.status)
        )
        .sort((a, b) => new Date(a.start) - new Date(b.start));

    const past = appointments
        .filter((a) =>
            new Date(a.end) < now ||
            ["Cancelled", "Completed"].includes(a.status)
        )
        .sort((a, b) => new Date(b.start) - new Date(a.start));

    function formatDate(date) {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    }

    function formatTime(date) {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    }

    function DateBadge({ date }) {
        const d = new Date(date);

        return (
            <div className="appointment-date-badge">
                <span>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <strong>{d.getDate()}</strong>
                <span>
                    {d.toLocaleDateString("en-US", { month: "short" })}
                </span>
            </div>
        );
    }

    function StatusBadge({ status }) {
        return (
            <span className={`appointment-status ${status.toLowerCase()}`}>
                ● {status}
            </span>
        );
    }

    if (loading) {
        return (
            <main className="appointments-page">
                <p>Loading appointments...</p>
            </main>
        );
    }

    return (
        <main className="appointments-page">
            <div className="appointments-page-header">
                <div>
                    <h1>My appointments</h1>
                    <p>View and manage your bookings</p>
                </div>

                <button
                    className="appointments-book-button"
                    onClick={() => navigate("/book")}
                >
                    + Book appointment
                </button>
            </div>

            {error && (
                <div className="appointments-error">{error}</div>
            )}

            <section className="appointments-section">
                <h2 className="appointments-section-title">Upcoming</h2>

                {upcoming.length === 0 && !error && (
                    <div className="appointments-empty">
                        <h3>No upcoming appointments</h3>
                        <p>Your next booking will appear here.</p>
                    </div>
                )}

                <div className="upcoming-list">
                    {upcoming.map((appointment) => (
                        <div className="upcoming-card" key={appointment.id}>
                            <div className="upcoming-card-content">




                                <DateBadge date={appointment.start} />

                                <div className="upcoming-card-info">
                                    <div className="upcoming-card-title">
                                        <h3>{appointment.serviceName}</h3>
                                        <StatusBadge status={appointment.status} />
                                    </div>

                                    <p>
                                        {formatTime(appointment.start)}
                                        {" – "}
                                        {formatTime(appointment.end)}
                                        {" with "}
                                        {appointment.staffName}
                                    </p>

                                    <div className="upcoming-reference">
                                        Reference
                                        <code>{appointment.reference}</code>
                                    </div>
                                </div>

                                <div className="upcoming-card-actions">
                                    <button
                                        className="appointment-reschedule-btn"
                                        type="button"
                                        onClick={() => openReschedule(appointment)}
                                    >
                                        Reschedule
                                    </button>

                                    <button
                                        className="appointment-cancel-btn"
                                        type="button"
                                        onClick={() => {
                                            setCancelError("");
                                            setCancelTarget(appointment);
                                        }}
                                    >
                                        ✕ Cancel
                                    </button>
                                </div>

                            </div>
                            {rescheduleId === appointment.id && (
                                <div className="reschedule-panel">
                                    <div className="reschedule-panel-heading">
                                        <strong>Choose a new time</strong>
                                        <span>
                                            Same service and staff. Your current time stays
                                            booked until you confirm.
                                        </span>
                                    </div>

                                    <div className="reschedule-date-picker">
                                        <label htmlFor={`date-${appointment.id}`}>
                                            New date
                                        </label>

                                        <input
                                            id={`date-${appointment.id}`}
                                            type="date"
                                            value={newDate}
                                            min={new Date().toLocaleDateString("en-CA")}
                                            onChange={(event) => {
                                                setNewDate(event.target.value);
                                                setNewTime("");
                                            }}
                                        />
                                    </div>

                                    {loadingSlots && <p>Loading available times...</p>}

                                    {!loadingSlots && newDate && (
                                        <div className="reschedule-slots">
                                            {availableSlots.length === 0 ? (
                                                <p>No available times for this date.</p>
                                            ) : (
                                                availableSlots.map((slot) => (
                                                    <button
                                                        key={slot.startTime}
                                                        type="button"
                                                        disabled={!slot.isAvailable}
                                                        className={`reschedule-slot ${newTime === slot.startTime
                                                            ? "selected"
                                                            : ""
                                                            }`}
                                                        onClick={() =>
                                                            setNewTime(slot.startTime)
                                                        }
                                                    >
                                                        {slot.startTime}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {rescheduleError && (
                                        <p className="reschedule-error">
                                            {rescheduleError}
                                        </p>
                                    )}

                                    <div className="reschedule-actions">
                                        <button
                                            type="button"
                                            className="reschedule-keep-btn"
                                            onClick={() => setRescheduleId(null)}
                                        >
                                            Keep current time
                                        </button>

                                        <button
                                            type="button"
                                            className="reschedule-confirm-btn"
                                            disabled={!newDate || !newTime || rescheduling}
                                            onClick={handleConfirmReschedule}
                                        >
                                            {rescheduling
                                                ? "Saving..."
                                                : `Confirm ${newTime || "new time"}`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className="appointments-section">
                <h2 className="appointments-section-title">Past</h2>

                <div className="past-appointments-table-wrapper">
                    <table className="past-appointments-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Service</th>
                                <th>Staff</th>
                                <th>Price</th>
                                <th>Reference</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {past.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{formatDate(appointment.start)}</td>
                                    <td>{appointment.serviceName}</td>
                                    <td>{appointment.staffName}</td>
                                    <td>
                                        {appointment.price != null
                                            ? `$${Number(appointment.price).toFixed(2)}`
                                            : "—"}
                                    </td>
                                    <td>
                                        <code>{appointment.reference}</code>
                                    </td>
                                    <td>
                                        <StatusBadge status={appointment.status} />
                                    </td>
                                </tr>
                            ))}

                            {past.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="past-empty">
                                        No past appointments yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>


            {cancelTarget && (
                <div
                    className="cancel-modal-overlay"
                    onClick={() => {
                        if (!cancelling) setCancelTarget(null);
                    }}
                >
                    <div
                        className="cancel-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-modal-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="cancel-modal-header">
                            <span className="cancel-modal-icon">✕</span>

                            <div>
                                <h3 id="cancel-modal-title">
                                    Cancel this appointment?
                                </h3>

                                <p>
                                    {cancelTarget.serviceName} with{" "}
                                    {cancelTarget.staffName}
                                </p>
                                <p>
                                    {formatDate(cancelTarget.start)} at{" "}
                                    {formatTime(cancelTarget.start)}
                                </p>
                            </div>
                        </div>

                        <div className="cancel-modal-notice">
                            Cancelling will release this appointment time
                            for other customers.
                        </div>

                        {cancelError && (
                            <p className="cancel-modal-error">
                                {cancelError}
                            </p>
                        )}

                        <div className="cancel-modal-actions">
                            <button
                                type="button"
                                className="cancel-keep-btn"
                                disabled={cancelling}
                                onClick={() => setCancelTarget(null)}
                            >
                                Keep appointment
                            </button>

                            <button
                                type="button"
                                className="cancel-confirm-btn"
                                disabled={cancelling}
                                onClick={handleCancelAppointment}
                            >
                                {cancelling
                                    ? "Cancelling..."
                                    : "Cancel appointment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
