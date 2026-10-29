
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import * as signalR from "@microsoft/signalr";
import api from "../api/axios";
import "../styles/LiveQueue.css";

// ------------------------------
// Helpers
// ------------------------------

const numberOf = (item) =>
    `A-${String(item.queueNumber).padStart(3, "0")}`;

// Backend sends UTC dates, sometimes without Z.
// Normalize them before using JavaScript Date.
const parseUtcDate = (value) => {
    if (!value) return null;

    const normalized =
        /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
            ? value
            : `${value}Z`;

    const date = new Date(normalized);

    return Number.isNaN(date.getTime()) ? null : date;
};

const formatTime = (value) => {
    const date = parseUtcDate(value);

    if (!date) return "—";

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Beirut",
    });
};

const getWaitingMinutes = (checkedInAt, now) => {
    const date = parseUtcDate(checkedInAt);

    if (!date || !now) return 0;

    return Math.max(
        0,
        Math.floor(
            (now - date.getTime()) / 60000
        )
    );
};

const getRole = () => {
    try {
        const user = JSON.parse(
            sessionStorage.getItem("user") || "{}"
        );

        return (
            user.role ||
            sessionStorage.getItem("role") ||
            ""
        );
    } catch {
        return sessionStorage.getItem("role") || "";
    }
};

const getErrorMessage = (err, fallback) => {
    const data = err.response?.data;

    if (typeof data === "string" && data.trim()) {
        return data;
    }

    return data?.message || fallback;
};

// ------------------------------
// Component
// ------------------------------

export default function LiveQueue() {
    const [queue, setQueue] = useState([]);
    const [reference, setReference] = useState("");

    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [toast, setToast] = useState(null);
    const [live, setLive] = useState(false);

    // Date.now() must not run during render.
    const [now, setNow] = useState(0);

    const previousQueue = useRef(null);
    const toastTimer = useRef(null);

    const role = getRole();
    const isAdmin = role === "Admin";

    // ------------------------------
    // Load Queue
    // ------------------------------

    const loadQueue = useCallback(async () => {
        try {
            const response = await api.get(
                "/api/queue/today"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            const previous = previousQueue.current;

            if (previous !== null) {
                const oldIds = new Set(
                    previous.map((item) => item.id)
                );

                const newCheckIn = data.find(
                    (item) =>
                        item.status === "CheckedIn" &&
                        !oldIds.has(item.id)
                );

                if (newCheckIn) {
                    setToast({
                        title: `${numberOf(newCheckIn)} checked in`,
                        description:
                            `${newCheckIn.customerName}, ` +
                            `for ${newCheckIn.staffName}`,
                    });

                    clearTimeout(toastTimer.current);

                    toastTimer.current = setTimeout(() => {
                        setToast(null);
                    }, 5000);
                }
            }

            previousQueue.current = data;

            setQueue(data);
            setError("");
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to load queue."
                )
            );
        }
    }, []);

    // ------------------------------
    // Initial Queue Load
    // ------------------------------

    useEffect(() => {
        const timer = setTimeout(() => {
            loadQueue();
        }, 0);

        return () => {
            clearTimeout(timer);
            clearTimeout(toastTimer.current);
        };
    }, [loadQueue]);

    // ------------------------------
    // Clock - update every 30 seconds
    // ------------------------------

    useEffect(() => {
        const updateTime = () => {
            setNow(Date.now());
        };

        // Run after mount, not during render.
        const initialTimer = setTimeout(updateTime, 0);

        const interval = setInterval(
            updateTime,
            30000
        );

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    // ------------------------------
    // SignalR Realtime Connection
    // ------------------------------

    useEffect(() => {
        const token = sessionStorage.getItem("token");

        const baseUrl = import.meta.env.VITE_API_URL;

        if (!token || !baseUrl) return;

        const connection =
            new signalR.HubConnectionBuilder()
                .withUrl(
                    `${baseUrl.replace(/\/$/, "")}/hubs/queue`,
                    {
                        accessTokenFactory: () =>
                            sessionStorage.getItem("token") || "",
                        withCredentials: false,
                    }
                )
                .withAutomaticReconnect()
                .build();

        connection.on("QueueUpdated", () => {
            loadQueue();
        });

        connection.onreconnecting(() => {
            setLive(false);
        });

        connection.onreconnected(() => {
            setLive(true);
            loadQueue();
        });

        connection.onclose(() => {
            setLive(false);
        });

        let disposed = false;

        connection
            .start()
            .then(() => {
                if (!disposed) {
                    setLive(true);
                }
            })
            .catch((err) => {
                if (!disposed) {
                    console.error("SignalR:", err);
                }
            });

        return () => {
            disposed = true;
            connection.stop();
        };
    }, [loadQueue]);

    // ------------------------------
    // Error Handler
    // ------------------------------

    const showError = (err, fallback) => {
        setError(getErrorMessage(err, fallback));
        setMessage("");
    };

    // ------------------------------
    // Check In
    // ------------------------------

    const checkIn = async () => {
        if (!reference.trim()) {
            setError(
                "Please enter a booking reference."
            );
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await api.post(
                "/api/appointments/check-in",
                {
                    reference: reference.trim(),
                }
            );

            setMessage(
                response.data?.message ||
                "Check-in successful."
            );

            setReference("");

            await loadQueue();
        } catch (err) {
            showError(err, "Check-in failed.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------
    // Call Customer
    // ------------------------------

    const callCustomer = async (id) => {
        setBusyId(id);
        setError("");
        setMessage("");

        try {
            await api.patch(
                `/api/queue/${id}/call`
            );

            setMessage(
                "Customer called successfully."
            );

            await loadQueue();
        } catch (err) {
            showError(
                err,
                "Unable to call customer."
            );
        } finally {
            setBusyId(null);
        }
    };

    // ------------------------------
    // Complete Customer
    // ------------------------------

    const completeCustomer = async (id) => {
        setBusyId(id);
        setError("");
        setMessage("");

        try {
            await api.patch(
                `/api/queue/${id}/complete`
            );

            setMessage(
                "Service completed successfully."
            );

            await loadQueue();
        } catch (err) {
            showError(
                err,
                "Unable to complete service."
            );
        } finally {
            setBusyId(null);
        }
    };

    // ------------------------------
    // Queue Groups
    // ------------------------------

    const waiting = useMemo(
        () =>
            queue.filter(
                (item) =>
                    item.status === "CheckedIn"
            ),
        [queue]
    );

    const inProgress = useMemo(
        () =>
            queue.filter(
                (item) =>
                    item.status === "InProgress"
            ),
        [queue]
    );

    // ------------------------------
    // Staff Cards
    // ------------------------------

    const staffCards = useMemo(() => {
        const names = [
            ...new Set(
                queue
                    .filter((item) =>
                        [
                            "CheckedIn",
                            "InProgress",
                        ].includes(item.status)
                    )
                    .map((item) => item.staffName)
            ),
        ];

        return names.map((name, index) => ({
            name,
            label: `Room ${index + 1}`,

            current: inProgress.find(
                (item) =>
                    item.staffName === name
            ),

            next: waiting.find(
                (item) =>
                    item.staffName === name
            ),
        }));
    }, [queue, inProgress, waiting]);

    // ------------------------------
    // Last Check In
    // ------------------------------

    const lastCheckIn = useMemo(() => {
        return [...queue]
            .filter((item) => item.checkedInAt)
            .sort((a, b) => {
                const dateA =
                    parseUtcDate(a.checkedInAt)?.getTime() || 0;

                const dateB =
                    parseUtcDate(b.checkedInAt)?.getTime() || 0;

                return dateB - dateA;
            })[0];
    }, [queue]);

    // ------------------------------
    // Average Waiting Time
    // ------------------------------

    const avgWait = waiting.length
        ? Math.round(
            waiting.reduce(
                (sum, item) =>
                    sum +
                    getWaitingMinutes(
                        item.checkedInAt,
                        now
                    ),
                0
            ) / waiting.length
        )
        : 0;

    // ------------------------------
    // Admin Reorder
    // ------------------------------

    const reorder = async (draggedId, targetId) => {
        if (!isAdmin || draggedId === targetId) {
            return;
        }

        const reordered = [...waiting];

        const from = reordered.findIndex(
            (item) => item.id === draggedId
        );

        const to = reordered.findIndex(
            (item) => item.id === targetId
        );

        if (from < 0 || to < 0) return;

        const [moved] = reordered.splice(from, 1);

        reordered.splice(to, 0, moved);

        try {
            await api.patch(
                "/api/queue/reorder",
                reordered.map((item) => item.id)
            );

            await loadQueue();
        } catch (err) {
            showError(
                err,
                "Unable to reorder queue."
            );
        }
    };

    // ------------------------------
    // Render
    // ------------------------------

    return (
        <div className="lq-page">

            {/* Header */}

            <header className="lq-header">
                <div className="lq-heading">
                    <h1>Live queue</h1>

                    <span>
                        {now
                            ? new Date(now).toLocaleDateString(
                                "en-GB",
                                {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    timeZone: "Asia/Beirut",
                                }
                            )
                            : "Loading date..."}, queue A
                    </span>
                </div>

                <div
                    className={`lq-live ${live ? "connected" : ""
                        }`}
                >
                    <span className="lq-live-dot" />

                    {live
                        ? "Live, updated just now"
                        : "Connecting..."}
                </div>
            </header>

            <div className="lq-content">

                {/* Messages */}

                {message && (
                    <div className="lq-alert lq-alert-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="lq-alert lq-alert-error">
                        {error}
                    </div>
                )}

                <div className="lq-top-grid">

                    {/* Check In Card */}

                    <section className="lq-checkin-card">
                        <h2>Check in a customer</h2>

                        <p>
                            Booking reference or QR code
                        </p>

                        <input
                            value={reference}
                            onChange={(e) =>
                                setReference(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    checkIn();
                                }
                            }}
                            placeholder="APT-XXXXXX"
                        />

                        <div className="lq-checkin-actions">
                            <button
                                className="lq-primary"
                                disabled={loading}
                                onClick={checkIn}
                            >
                                {loading
                                    ? "Checking..."
                                    : "Check in"}
                            </button>

                            <button
                                className="lq-outline"
                                onClick={() =>
                                    setMessage(
                                        "QR scanner will be added next."
                                    )
                                }
                            >
                                ▦ Scan QR
                            </button>
                        </div>

                        <div className="lq-last-checkin">
                            {lastCheckIn
                                ? `Last check-in: ${numberOf(
                                    lastCheckIn
                                )} ${lastCheckIn.customerName
                                }, ${formatTime(
                                    lastCheckIn.checkedInAt
                                )}`
                                : "No check-ins today"}
                        </div>
                    </section>

                    {/* Staff Cards */}

                    <div className="lq-staff-grid">

                        {staffCards.length === 0 && (
                            <div className="lq-empty-staff">
                                No active staff queue today.
                            </div>
                        )}

                        {staffCards.map((staff) => (
                            <article
                                key={staff.name}
                                className={`lq-staff-card ${staff.current
                                    ? "lq-staff-busy"
                                    : "lq-staff-free"
                                    }`}
                            >
                                <h3>{staff.label}</h3>

                                <p className="lq-staff-name">
                                    {staff.name}
                                </p>

                                {staff.current ? (
                                    <>
                                        <strong className="lq-staff-number">
                                            {numberOf(
                                                staff.current
                                            )}
                                        </strong>

                                        <div className="lq-customer">
                                            {
                                                staff.current
                                                    .customerName
                                            }
                                        </div>

                                        <div className="lq-service-name">
                                            {
                                                staff.current
                                                    .serviceName
                                            }
                                        </div>

                                        <div className="lq-service-status">
                                            ● In Service
                                        </div>

                                        <button
                                            className="lq-outline lq-card-button"
                                            disabled={
                                                busyId ===
                                                staff.current.id
                                            }
                                            onClick={() =>
                                                completeCustomer(
                                                    staff.current.id
                                                )
                                            }
                                        >
                                            ✓ Complete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <strong className="lq-free-label">
                                            Free
                                        </strong>

                                        <div className="lq-next-label">
                                            {staff.next
                                                ? `Next for ${staff.name}`
                                                : "Available"}
                                        </div>

                                        {staff.next && (
                                            <>
                                                <div className="lq-next-customer">
                                                    {numberOf(
                                                        staff.next
                                                    )}{" "}
                                                    {
                                                        staff.next
                                                            .customerName
                                                    }
                                                </div>

                                                <div className="lq-service-name">
                                                    {
                                                        staff.next
                                                            .serviceName
                                                    }
                                                </div>

                                                <button
                                                    className="lq-primary lq-card-button"
                                                    disabled={
                                                        busyId ===
                                                        staff.next.id
                                                    }
                                                    onClick={() =>
                                                        callCustomer(
                                                            staff.next.id
                                                        )
                                                    }
                                                >
                                                    Call{" "}
                                                    {numberOf(
                                                        staff.next
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                            </article>
                        ))}
                    </div>
                </div>

                {/* Waiting Table */}

                <section className="lq-waiting-card">

                    <div className="lq-waiting-header">
                        <div>
                            <strong>Waiting</strong>

                            <span className="lq-count">
                                {waiting.length}
                            </span>

                            <span className="lq-muted">
                                In check-in order. Drag to change
                                priority (admins only).
                            </span>
                        </div>

                        <span className="lq-muted">
                            Avg. wait {avgWait} min
                        </span>
                    </div>

                    <div className="lq-table-scroll">
                        <table className="lq-table">

                            <thead>
                                <tr>
                                    <th />
                                    <th>Number</th>
                                    <th>Customer</th>
                                    <th>Service</th>
                                    <th>Staff</th>
                                    <th>Checked in</th>
                                    <th>Waiting</th>
                                    <th>Est. call</th>
                                    <th />
                                </tr>
                            </thead>

                            <tbody>
                                {waiting.map((item) => {
                                    const waitMinutes =
                                        getWaitingMinutes(
                                            item.checkedInAt,
                                            now
                                        );

                                    return (
                                        <tr
                                            key={item.id}
                                            draggable={isAdmin}
                                            onDragStart={(e) => {
                                                if (!isAdmin) return;

                                                e.dataTransfer.setData(
                                                    "text/plain",
                                                    String(item.id)
                                                );
                                            }}
                                            onDragOver={(e) => {
                                                if (isAdmin) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onDrop={(e) => {
                                                if (!isAdmin) return;

                                                e.preventDefault();

                                                const draggedId =
                                                    Number(
                                                        e.dataTransfer.getData(
                                                            "text/plain"
                                                        )
                                                    );

                                                reorder(
                                                    draggedId,
                                                    item.id
                                                );
                                            }}
                                        >
                                            <td className="lq-drag-cell">
                                                {isAdmin ? "⠿" : ""}
                                            </td>

                                            <td className="lq-number">
                                                {numberOf(item)}
                                            </td>

                                            <td>
                                                {item.customerName}
                                            </td>

                                            <td>
                                                {item.serviceName}
                                            </td>

                                            <td>
                                                {item.staffName}
                                            </td>

                                            <td>
                                                {formatTime(
                                                    item.checkedInAt
                                                )}
                                            </td>

                                            <td>
                                                {waitMinutes} min
                                            </td>

                                            <td className="lq-estimate">
                                                {item.estimatedWaitMinutes === 0
                                                    ? "Now"
                                                    : formatTime(
                                                        item.estimatedCallAt
                                                    )}
                                            </td>

                                            <td>
                                                <button
                                                    className="lq-outline lq-call-button"
                                                    disabled={
                                                        busyId === item.id
                                                    }
                                                    onClick={() =>
                                                        callCustomer(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    Call
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {waiting.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="lq-empty"
                                        >
                                            No customers waiting.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </section>
            </div>

            {/* Realtime Toast */}

            {toast && (
                <div className="lq-toast">
                    <span className="lq-toast-icon">
                        ◉
                    </span>

                    <div>
                        <strong>{toast.title}</strong>
                        <p>{toast.description}</p>
                    </div>

                    <button
                        onClick={() => setToast(null)}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}
