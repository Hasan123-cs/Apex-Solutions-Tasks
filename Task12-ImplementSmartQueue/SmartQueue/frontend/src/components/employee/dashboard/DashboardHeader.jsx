
import { useState } from "react";
import {
    CalendarDays,
    Bell,
    ChevronDown
} from "lucide-react";

export default function DashboardHeader({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    live
}) {
    const [showPicker, setShowPicker] = useState(false);
    const [draftStart, setDraftStart] = useState(startDate);
    const [draftEnd, setDraftEnd] = useState(endDate);

    const formatDate = (value) => {
        if (!value) return "";

        return new Date(`${value}T12:00:00Z`)
            .toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "UTC"
            });
    };

    const applyRange = () => {
        if (!draftStart || !draftEnd || draftStart > draftEnd) {
            return;
        }

        setStartDate(draftStart);
        setEndDate(draftEnd);
        setShowPicker(false);
    };

    return (
        <header className="dashboard-header">
            <div className="dashboard-heading">
                <h1>Dashboard</h1>

                <span>
                    {new Date().toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "Asia/Beirut"
                    })}
                </span>
            </div>

            <div className="dashboard-header-actions">
                <span className={`dashboard-live ${live ? "active" : ""}`}>
                    <span className="dashboard-live-dot" />
                    {live ? "Live" : "Connecting"}
                </span>

                <div className="dashboard-date-wrapper">
                    <button
                        type="button"
                        className="dashboard-date-button"
                        onClick={() => {
                            setDraftStart(startDate);
                            setDraftEnd(endDate);
                            setShowPicker(!showPicker);
                        }}
                    >
                        <CalendarDays size={15} />

                        {formatDate(startDate)} – {formatDate(endDate)}

                        <ChevronDown size={14} />
                    </button>

                    {showPicker && (
                        <div className="dashboard-date-popover">
                            <label>
                                From
                                <input
                                    type="date"
                                    value={draftStart}
                                    max={draftEnd}
                                    onChange={(e) =>
                                        setDraftStart(e.target.value)
                                    }
                                />
                            </label>

                            <label>
                                To
                                <input
                                    type="date"
                                    value={draftEnd}
                                    min={draftStart}
                                    onChange={(e) =>
                                        setDraftEnd(e.target.value)
                                    }
                                />
                            </label>

                            <button
                                type="button"
                                onClick={applyRange}
                                disabled={
                                    !draftStart ||
                                    !draftEnd ||
                                    draftStart > draftEnd
                                }
                            >
                                Apply
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="dashboard-notification-button"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <Bell size={17} />
                </button>
            </div>
        </header>
    );
}
