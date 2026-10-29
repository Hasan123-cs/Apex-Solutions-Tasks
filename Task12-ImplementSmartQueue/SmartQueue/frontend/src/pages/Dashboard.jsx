
import { useCallback, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

import api from "../api/axios";

import DashboardHeader from "../components/employee/dashboard/DashboardHeader";
import DashboardStats from "../components/employee/dashboard/DashboardStats";
import AppointmentsChart from "../components/employee/dashboard/AppointmentsChart";
import LiveQueuePreview from "../components/employee/dashboard/LiveQueuePreview";
import UpcomingAppointments from "../components/employee/dashboard/UpcomingAppointments";

import "../styles/Dashboard.css";

// Current date in Beirut
const getBeirutToday = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Beirut",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const get = (type) =>
        parts.find((part) => part.type === type)?.value;

    return `${get("year")}-${get("month")}-${get("day")}`;
};

// Add or subtract calendar days
const addDays = (dateString, days) => {
    const date = new Date(`${dateString}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);

    return date.toISOString().slice(0, 10);
};

export default function Dashboard() {
    const [dateRange, setDateRange] = useState(() => {
        const today = getBeirutToday();

        return {
            startDate: addDays(today, -6),
            endDate: today
        };
    });

    const { startDate, endDate } = dateRange;

    const [stats, setStats] = useState(null);
    const [chart, setChart] = useState([]);
    const [queue, setQueue] = useState([]);
    const [upcoming, setUpcoming] = useState([]);

    const [loading, setLoading] = useState(true);
    const [queueLoading, setQueueLoading] = useState(true);
    const [live, setLive] = useState(false);
    const [error, setError] = useState("");

    // Always keep latest selected date range for SignalR callbacks
    const dateRangeRef = useRef(dateRange);

    useEffect(() => {
        dateRangeRef.current = dateRange;
    }, [dateRange]);

    const setStartDate = useCallback((value) => {
        setDateRange((previous) => ({
            ...previous,
            startDate: value
        }));
    }, []);

    const setEndDate = useCallback((value) => {
        setDateRange((previous) => ({
            ...previous,
            endDate: value
        }));
    }, []);

    // Load the date-dependent dashboard data
    useEffect(() => {
        let cancelled = false;

        async function fetchDashboard() {
            try {
                const params = { startDate, endDate };

                const [
                    statsResponse,
                    chartResponse,
                    upcomingResponse
                ] = await Promise.all([
                    api.get("/api/dashboard/stats", { params }),
                    api.get("/api/dashboard/chart", { params }),
                    api.get("/api/dashboard/upcoming")
                ]);

                if (cancelled) return;

                setStats(statsResponse.data);
                setChart(chartResponse.data);
                setUpcoming(upcomingResponse.data);
                setError("");
            } catch (err) {
                if (!cancelled) {
                    console.error("Dashboard loading failed:", err);
                    setError("Failed to load dashboard.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchDashboard();

        return () => {
            cancelled = true;
        };
    }, [startDate, endDate]);

    // Load live queue independently
    const refreshRealtimeData = useCallback(async () => {
        try {
            const params = dateRangeRef.current;

            const [queueResponse, statsResponse] = await Promise.all([
                api.get("/api/queue/today"),
                api.get("/api/dashboard/stats", { params })
            ]);

            setQueue(queueResponse.data);

            // Don't overwrite stats for a newer selected date range
            if (
                params.startDate === dateRangeRef.current.startDate &&
                params.endDate === dateRangeRef.current.endDate
            ) {
                setStats(statsResponse.data);
            }
        } catch (err) {
            console.error("Realtime refresh failed:", err);
        } finally {
            setQueueLoading(false);
        }
    }, []);

    // Initial live queue fetch
    useEffect(() => {
        let active = true;

        api.get("/api/queue/today")
            .then((response) => {
                if (active) {
                    setQueue(response.data);
                }
            })
            .catch((err) => {
                console.error("Queue loading failed:", err);
            })
            .finally(() => {
                if (active) {
                    setQueueLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    // SignalR connection
    useEffect(() => {
        const baseUrl = import.meta.env.VITE_API_URL;
        const token = sessionStorage.getItem("token");

        if (!baseUrl || !token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(
                `${baseUrl.replace(/\/$/, "")}/hubs/queue`,
                {
                    accessTokenFactory: () =>
                        sessionStorage.getItem("token") || "",
                    withCredentials: false
                }
            )
            .withAutomaticReconnect()
            .build();

        connection.on("QueueUpdated", refreshRealtimeData);

        connection.onreconnecting(() => {
            setLive(false);
        });

        connection.onreconnected(() => {
            setLive(true);
            refreshRealtimeData();
        });

        connection.onclose(() => {
            setLive(false);
        });

        let disposed = false;

        connection.start()
            .then(() => {
                if (disposed) {
                    connection.stop();
                    return;
                }

                setLive(true);
                refreshRealtimeData();
            })
            .catch((err) => {
                console.error("SignalR connection failed:", err);
            });

        return () => {
            disposed = true;
            connection.off("QueueUpdated", refreshRealtimeData);
            connection.stop();
        };
    }, [refreshRealtimeData]);

    // Display skeleton when a different range is selected
    const [loadedRange, setLoadedRange] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const params = { startDate, endDate };

        Promise.all([
            api.get("/api/dashboard/stats", { params }),
            api.get("/api/dashboard/chart", { params })
        ]).then(() => {
            if (!cancelled) {
                setLoadedRange(`${startDate}|${endDate}`);
            }
        }).catch((err) => {
            console.error("Range loading failed:", err);
        });

        return () => {
            cancelled = true;
        };
    }, [startDate, endDate]);

    const rangeLoading =
        loading || loadedRange !== `${startDate}|${endDate}`;

    return (
        <div className="dashboard-page">
            <DashboardHeader
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                live={live}
            />

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            <DashboardStats
                stats={stats}
                loading={rangeLoading}
            />

            <div className="dashboard-main-grid">
                <AppointmentsChart
                    data={chart}
                    loading={rangeLoading}
                />

                <LiveQueuePreview
                    queue={queue}
                    loading={queueLoading}
                />
            </div>

            <UpcomingAppointments
                appointments={upcoming}
                loading={loading}
            />
        </div>
    );
}
