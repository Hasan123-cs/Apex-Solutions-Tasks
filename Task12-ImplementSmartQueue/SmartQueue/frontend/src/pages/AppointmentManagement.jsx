
import { useState, useMemo } from "react";
import api from "../api/axios";

import useAppointments from "../hooks/useAppointments";

import AppointmentFilters from "../components/employee/AppointmentFilters";
import AppointmentStatusTabs from "../components/employee/AppointmentStatusTabs";
import AppointmentTable from "../components/employee/AppointmentTable";

import "../styles/AppointmentManagement.css";

// Get today's date in YYYY-MM-DD format
function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function AppointmentManagement() {
    // 1. Filter states
    const [date, setDate] = useState(getToday);
    const [search, setSearch] = useState("");
    const [staffId, setStaffId] = useState("All");
    const [activeStatus, setActiveStatus] = useState("All");

    // 2. Action states
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");
    const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
    const [newStart, setNewStart] = useState("");
    // 3. Get appointments from backend
    const {
        appointments,
        loading,
        error,
        refresh,
    } = useAppointments(date);

    const role = sessionStorage.getItem("role");

    const canViewAll =
        role === "Admin" ||
        role === "Receptionist";

    // 4. Build staff dropdown options
    const staffOptions = useMemo(() => {
        const uniqueStaff = new Map();

        appointments.forEach((appointment) => {
            uniqueStaff.set(appointment.staffId, {
                id: appointment.staffId,
                name: appointment.staffName,
            });
        });

        return Array.from(uniqueStaff.values());
    }, [appointments]);

    // 5. Handle appointment actions

    async function handleAppointmentAction(appointment, action) {
        if (actionLoading) return;

        setActionError("");
        setActionSuccess("");
        if (action === "reschedule") {
            setRescheduleAppointment(appointment);
            setNewStart("");
            return;
        }
        const endpoints = {
            confirm: `/api/appointments/${appointment.id}/confirm`,
            cancel: `/api/appointments/${appointment.id}/staff-cancel`,
            "no-show": `/api/appointments/${appointment.id}/no-show`,
        };

        // Check-in uses POST, not PATCH
        if (!["confirm", "cancel", "check-in", "no-show"].includes(action)) {
            setActionError(`${action} is not implemented yet.`);
            return;
        }

        // Confirm before cancelling / no-show 
        if (
            (action === "cancel" || action === "no-show") &&
            !window.confirm(
                `Are you sure you want to ${action === "no-show" ? "mark as No-show" : "cancel"
                } appointment ${appointment.reference}?`
            )
        ) {
            return;
        }

        try {
            setActionLoading(true);

            if (action === "check-in") {
                // Send appointment reference to backend
                const response = await api.post(
                    "/api/appointments/check-in",
                    {
                        reference: appointment.reference,
                    }
                );

                // Get generated queue number
                const queueNumber = response.data.queueNumber;

                setActionSuccess(
                    `Appointment ${appointment.reference} checked in successfully! Queue number: ${queueNumber}`
                );

            } else {
                // Confirm or Cancel
                await api.patch(endpoints[action]);

                setActionSuccess(
                    `Appointment ${appointment.reference} ${action === "confirm"
                        ? "confirmed"
                        : action === "no-show"
                            ? "marked as No-show"
                            : "cancelled"
                    } successfully.`
                );
            }

            // Refresh appointments and status counts
            await refresh();

        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                `Failed to ${action} appointment.`
            );
        } finally {
            setActionLoading(false);
        }
    }


    // 5.1 handle reschedule 
    async function handleRescheduleSubmit(event) {
        event.preventDefault();

        if (!rescheduleAppointment || !newStart || actionLoading) return;

        setActionError("");
        setActionSuccess("");

        const [selectedDate, selectedTime] = newStart.split("T");

        try {
            setActionLoading(true);

            await api.patch(
                `/api/appointments/${rescheduleAppointment.id}/staff-reschedule`,
                {
                    date: selectedDate,
                    startTime: selectedTime,
                }
            );

            setActionSuccess(
                `Appointment ${rescheduleAppointment.reference} rescheduled successfully.`
            );

            setRescheduleAppointment(null);
            setNewStart("");

            await refresh();
        } catch (err) {
            setActionError(
                err.response?.data?.message ||
                "Failed to reschedule appointment."
            );
        } finally {
            setActionLoading(false);
        }
    }
    // 6. Apply search and staff filters
    const matchingAppointments = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return appointments.filter((appointment) => {
            const matchesSearch =
                appointment.reference
                    .toLowerCase()
                    .includes(searchText) ||
                appointment.customerName
                    .toLowerCase()
                    .includes(searchText);

            const matchesStaff =
                !canViewAll ||
                staffId === "All" ||
                appointment.staffId === staffId;

            return matchesSearch && matchesStaff;
        });
    }, [appointments, search, staffId, canViewAll]);

    // 7. Apply selected status filter
    const filteredAppointments = useMemo(() => {
        if (activeStatus === "All") {
            return matchingAppointments;
        }

        return matchingAppointments.filter(
            (appointment) =>
                appointment.status === activeStatus
        );
    }, [matchingAppointments, activeStatus]);

    return (
        <main className="employee-appointments-page">
            <div className="employee-page-header">
                <div>
                    <h1>Appointments</h1>
                    <p>
                        Manage bookings, check-ins, and appointment statuses.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refresh}
                    disabled={loading || actionLoading}
                >
                    Refresh
                </button>
            </div>

            <AppointmentFilters
                search={search}
                onSearchChange={setSearch}
                date={date}
                onDateChange={setDate}
                staffId={staffId}
                onStaffChange={setStaffId}
                staffOptions={staffOptions}
                canViewAll={canViewAll}
            />

            <AppointmentStatusTabs
                appointments={matchingAppointments}
                activeStatus={activeStatus}
                onStatusChange={setActiveStatus}
            />

            {actionError && (
                <p className="employee-error-message" role="alert">
                    {actionError}
                </p>
            )}

            {actionSuccess && (
                <p className="employee-success-message" role="status">
                    {actionSuccess}
                </p>
            )}

            {loading ? (
                <p>Loading appointments...</p>
            ) : error ? (
                <div className="employee-error">
                    <p>{error}</p>
                    <button type="button" onClick={refresh}>
                        Try again
                    </button>
                </div>
            ) : (
                <AppointmentTable
                    appointments={filteredAppointments}
                    role={role}
                    onAction={handleAppointmentAction}
                />
            )}
            {/* modal of reschedule  */}
            {rescheduleAppointment && (
                <div className="employee-reschedule-overlay">
                    <form
                        className="employee-reschedule-modal"
                        onSubmit={handleRescheduleSubmit}
                    >
                        <h2>Reschedule Appointment</h2>

                        <p>
                            Reference: {rescheduleAppointment.reference}
                        </p>

                        <label htmlFor="reschedule-start">
                            New Date & Time
                        </label>

                        <input
                            id="reschedule-start"
                            type="datetime-local"
                            value={newStart}
                            onChange={(event) => setNewStart(event.target.value)}
                            required
                        />

                        <div className="employee-reschedule-buttons">
                            <button
                                type="button"
                                onClick={() => setRescheduleAppointment(null)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={actionLoading || !newStart}
                            >
                                {actionLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}
