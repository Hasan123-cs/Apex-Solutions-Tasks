
import { useEffect, useMemo, useState } from "react";

import { useStaff } from "../Context/StaffContext";
import api from "../api/axios";

import StaffList from "../components/employee/staff/StaffList";
import StaffProfile from "../components/employee/staff/StaffProfile";
import WeeklySchedule from "../components/employee/staff/WeeklySchedule";
import QualifiedServices from "../components/employee/staff/QualifiedServices";
import StaffModal from "../components/employee/staff/StaffModal";

import "../styles/Staff.css";

const EMPTY_SCHEDULE = {
    weeklyIntervals: [],
    daysOff: [],
    qualifiedServiceIds: [],
};

function normalizeSchedule(schedule) {
    return {
        weeklyIntervals: schedule?.weeklyIntervals ?? [],
        daysOff: schedule?.daysOff ?? [],
        qualifiedServiceIds: schedule?.qualifiedServiceIds ?? [],
    };
}

function getErrorMessage(error, fallback) {
    const data = error.response?.data;

    if (typeof data === "string") return data;

    return data?.message || data?.title || fallback;
}

export default function Staff() {
    const {
        staff,
        loading,
        error,
        fetchStaff,
        createStaff,
        getStaffSchedule,
        updateStaffSchedule,
    } = useStaff();

    const [selectedStaffId, setSelectedStaffId] = useState(null);
    const [search, setSearch] = useState("");

    const [services, setServices] = useState([]);
    const [servicesError, setServicesError] = useState("");

    const [schedule, setSchedule] = useState(EMPTY_SCHEDULE);
    const [savedSchedule, setSavedSchedule] =
        useState(EMPTY_SCHEDULE);

    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [message, setMessage] = useState("");

    const [scheduleLoadError, setScheduleLoadError] = useState("");
    const [scheduleSaveError, setScheduleSaveError] = useState("");

    // Find selected employee.
    const selectedStaff = useMemo(
        () =>
            staff.find((member) => member.id === selectedStaffId) ??
            null,
        [staff, selectedStaffId]
    );

    // Both Staff and Receptionist can have schedules.
    const canHaveSchedule =
        selectedStaff?.role === "Staff" ||
        selectedStaff?.role === "Receptionist";

    // Only Staff can provide booking services.
    const canProvideServices =
        selectedStaff?.role === "Staff";

    // Load employees.
    useEffect(() => {
        let active = true;

        async function loadStaff() {
            try {
                const members = await fetchStaff();

                if (active) {
                    setSelectedStaffId((previous) =>
                        members.some((member) => member.id === previous)
                            ? previous
                            : members[0]?.id ?? null
                    );
                }
            } catch {
                // StaffContext handles this error.
            }
        }

        void loadStaff();

        return () => {
            active = false;
        };
    }, [fetchStaff]);

    // Load services.
    useEffect(() => {
        let active = true;

        async function loadServices() {
            try {
                const response = await api.get("/api/services/admin");

                if (active) {
                    setServices(response.data);
                    setServicesError("");
                }
            } catch (err) {
                if (active) {
                    setServicesError(
                        getErrorMessage(err, "Failed to load services.")
                    );
                }
            }
        }

        void loadServices();

        return () => {
            active = false;
        };
    }, []);

    // Load schedule when selected employee changes.
    useEffect(() => {
        let active = true;

        async function loadSchedule() {
            setSchedule(EMPTY_SCHEDULE);
            setSavedSchedule(EMPTY_SCHEDULE);
            setScheduleLoadError("");
            setScheduleSaveError("");
            setMessage("");

            if (!selectedStaffId || !canHaveSchedule) {
                setScheduleLoading(false);
                return;
            }

            setScheduleLoading(true);

            try {
                const response =
                    await getStaffSchedule(selectedStaffId);

                if (!active) return;

                const loaded = normalizeSchedule(response);

                setSchedule(loaded);
                setSavedSchedule(loaded);
            } catch (err) {
                if (active) {
                    setScheduleLoadError(
                        getErrorMessage(
                            err,
                            "Failed to load employee schedule."
                        )
                    );
                }
            } finally {
                if (active) {
                    setScheduleLoading(false);
                }
            }
        }

        void loadSchedule();

        return () => {
            active = false;
        };
    }, [
        selectedStaffId,
        canHaveSchedule,
        getStaffSchedule,
    ]);

    // Check whether schedule has unsaved changes.
    const hasChanges = useMemo(() => {
        const normalize = (value) => ({
            weeklyIntervals: [...value.weeklyIntervals]
                .map((interval) => ({
                    dayOfWeek: interval.dayOfWeek,
                    from: interval.from,
                    to: interval.to,
                }))
                .sort(
                    (a, b) =>
                        a.dayOfWeek - b.dayOfWeek ||
                        a.from.localeCompare(b.from) ||
                        a.to.localeCompare(b.to)
                ),

            daysOff: [...value.daysOff].sort(),

            qualifiedServiceIds: [
                ...value.qualifiedServiceIds,
            ].sort((a, b) => a - b),
        });

        return (
            JSON.stringify(normalize(schedule)) !==
            JSON.stringify(normalize(savedSchedule))
        );
    }, [schedule, savedSchedule]);

    // Select an employee.
    const handleSelectStaff = (member) => {
        if (saving || scheduleLoading) return;

        if (member.id === selectedStaffId) return;

        if (
            hasChanges &&
            !window.confirm(
                "Discard unsaved schedule changes?"
            )
        ) {
            return;
        }

        setSelectedStaffId(member.id);
    };

    // Update working intervals.
    const handleWeeklyIntervalsChange = (weeklyIntervals) => {
        setSchedule((previous) => ({
            ...previous,
            weeklyIntervals,
        }));

        setScheduleSaveError("");
        setMessage("");
    };

    // Update qualified services.
    const handleQualifiedServicesChange = (
        qualifiedServiceIds
    ) => {
        setSchedule((previous) => ({
            ...previous,
            qualifiedServiceIds,
        }));

        setScheduleSaveError("");
        setMessage("");
    };

    // Save employee schedule.
    const handleSaveSchedule = async () => {
        if (
            !selectedStaff ||
            !canHaveSchedule ||
            saving ||
            scheduleLoading ||
            scheduleLoadError ||
            !hasChanges
        ) {
            return;
        }

        setSaving(true);
        setMessage("");
        setScheduleSaveError("");

        try {
            const payload = {
                weeklyIntervals: schedule.weeklyIntervals,
                daysOff: schedule.daysOff,

                // Receptionists do not have qualified services.
                qualifiedServiceIds: canProvideServices
                    ? schedule.qualifiedServiceIds
                    : [],
            };

            const updated = await updateStaffSchedule(
                selectedStaff.id,
                payload
            );

            const normalized = normalizeSchedule(updated);

            setSchedule(normalized);
            setSavedSchedule(normalized);

            setMessage("Schedule saved successfully.");
        } catch (err) {
            setScheduleSaveError(
                getErrorMessage(
                    err,
                    "Failed to save employee schedule."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // Create Staff or Receptionist account.
    const handleCreateStaff = async (data) => {
        setCreating(true);

        try {
            const created = await createStaff(data);

            setModalOpen(false);
            setSelectedStaffId(created.id);
            setMessage("Employee account created successfully.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="staff-page">
            <div className="staff-page-header">
                <div>
                    <h1>Staff</h1>
                    <p>
                        Manage your team, working hours, and services.
                    </p>
                </div>

                <button
                    type="button"
                    className="staff-primary-btn"
                    onClick={() => setModalOpen(true)}
                >
                    + Add staff member
                </button>
            </div>

            {error && (
                <p className="staff-form-error" role="alert">
                    {error}
                </p>
            )}

            {servicesError && (
                <p className="staff-form-error" role="alert">
                    {servicesError}
                </p>
            )}

            {message && (
                <p
                    className="staff-success-message"
                    role="status"
                >
                    {message}
                </p>
            )}

            <div className="staff-page-grid">
                <StaffList
                    staff={staff}
                    selectedStaffId={selectedStaffId}
                    onSelect={handleSelectStaff}
                    search={search}
                    onSearchChange={setSearch}
                    loading={loading}
                />

                <div className="staff-content">
                    {selectedStaff ? (
                        <>
                            <StaffProfile member={selectedStaff} />

                            {canHaveSchedule && (
                                <>
                                    {scheduleLoadError && (
                                        <p
                                            className="staff-form-error"
                                            role="alert"
                                        >
                                            {scheduleLoadError}
                                        </p>
                                    )}

                                    {scheduleSaveError && (
                                        <p
                                            className="staff-form-error"
                                            role="alert"
                                        >
                                            {scheduleSaveError}
                                        </p>
                                    )}

                                    {scheduleLoading ? (
                                        <p>Loading schedule...</p>
                                    ) : (
                                        <>
                                            <WeeklySchedule
                                                intervals={
                                                    schedule.weeklyIntervals
                                                }
                                                onChange={
                                                    handleWeeklyIntervalsChange
                                                }
                                                onSave={handleSaveSchedule}
                                                saving={saving}
                                                hasChanges={hasChanges}
                                                disabled={
                                                    saving ||
                                                    Boolean(scheduleLoadError)
                                                }
                                            />

                                            {canProvideServices && (
                                                <QualifiedServices
                                                    services={services}
                                                    selectedServiceIds={
                                                        schedule.qualifiedServiceIds
                                                    }
                                                    onChange={
                                                        handleQualifiedServicesChange
                                                    }
                                                    disabled={
                                                        saving ||
                                                        Boolean(scheduleLoadError) ||
                                                        Boolean(servicesError)
                                                    }
                                                />
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="staff-info-card">
                            <h3>No staff member selected</h3>
                            <p>
                                Select a team member to view their details.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {modalOpen && (
                <StaffModal
                    saving={creating}
                    onClose={() => setModalOpen(false)}
                    onSave={handleCreateStaff}
                />
            )}
        </div>
    );
}
