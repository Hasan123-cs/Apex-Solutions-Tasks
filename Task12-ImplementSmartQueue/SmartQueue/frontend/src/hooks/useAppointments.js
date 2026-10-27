import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export default function useAppointments(date) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // same function reference if and only if the date not change  (useCallback)
    const fetchAppointments = useCallback(async (signal) => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/appointments", {
                params: { date },
                signal,
            });

            if (!signal?.aborted) {
                setAppointments(response.data);
            }
        } catch (err) {
            if (err.code === "ERR_CANCELED") return;

            setError(
                err.response?.data?.message ||
                "Failed to load appointments."
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [date]);
    // lets suppose the date change when the api calling so abort controller prevent it by abort the old one 

    useEffect(() => {
        const controller = new AbortController();

        fetchAppointments(controller.signal);

        return () => controller.abort();
    }, [fetchAppointments]);
    // refresh use to refresh the component 

    return {
        appointments,
        loading,
        error,
        refresh: () => fetchAppointments(),
    };
}