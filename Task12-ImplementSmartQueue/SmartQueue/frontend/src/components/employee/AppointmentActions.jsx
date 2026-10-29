
import { useEffect, useRef, useState } from "react";
import {
    MoreHorizontal,
    ScanLine,
    CalendarClock,
    Check,
    CalendarX,
} from "lucide-react";
import { UserX } from "lucide-react";
import "../../styles/AppointmentActions.css";

export default function AppointmentActions({
    appointment,
    role,
    onAction,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    const status = appointment.status;

    const canConfirm =
        role === "Admin" || role === "Receptionist";

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    function handleAction(action) {
        setIsOpen(false);
        onAction(appointment, action);
    }

    const isConfirmed = status === "Confirmed";

    const canCheckIn = isConfirmed;

    const canReschedule =
        canConfirm &&
        (status === "Pending" || status === "Confirmed");

    const canCancel =
        status === "Pending" || status === "Confirmed";
    const canMarkNoShow =
        canConfirm && status === "Confirmed" &&
        new Date(appointment.start) <= new Date();
    const showConfirm =
        canConfirm &&
        (status === "Pending" || isConfirmed);

    const hasActions =
        canCheckIn ||
        canReschedule ||
        canCancel ||
        showConfirm ||
        canMarkNoShow;

    if (!hasActions) {
        return <span className="employee-no-actions">—</span>;
    }

    return (
        <div className="employee-action-container" ref={menuRef}>
            <button
                type="button"
                className="employee-action-trigger"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Appointment actions"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <MoreHorizontal size={20} />
            </button>

            {isOpen && (
                <div className="employee-action-menu" role="menu">
                    <p className="employee-action-menu-title">
                        {status} booking
                    </p>

                    {canCheckIn && (
                        <button
                            type="button"
                            role="menuitem"
                            className="employee-action-item"
                            onClick={() => handleAction("check-in")}
                        >
                            <ScanLine size={17} />
                            <span>Check in</span>
                            <small>adds to queue</small>
                        </button>
                    )}

                    {canReschedule && (
                        <button
                            type="button"
                            role="menuitem"
                            className="employee-action-item"
                            onClick={() => handleAction("reschedule")}
                        >
                            <CalendarClock size={17} />
                            <span>Reschedule</span>
                        </button>
                    )}

                    {showConfirm && (
                        <button
                            type="button"
                            role="menuitem"
                            className="employee-action-item"
                            disabled={isConfirmed}
                            onClick={() => handleAction("confirm")}
                        >
                            <Check size={17} />
                            <span>Confirm</span>
                            {isConfirmed && <small>done</small>}
                        </button>
                    )}

                    {canMarkNoShow && (
                        <button
                            type="button"
                            role="menuitem"
                            className="employee-action-item"
                            onClick={() => handleAction("no-show")}
                        >
                            <UserX size={17} />
                            <span>Mark No-show</span>
                        </button>
                    )}

                    {canCancel && (
                        <>
                            <div className="employee-action-divider" />

                            <button
                                type="button"
                                role="menuitem"
                                className="employee-action-item danger"
                                onClick={() => handleAction("cancel")}
                            >
                                <CalendarX size={17} />
                                <span>Cancel appointment</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
