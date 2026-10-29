
import { useState, useEffect, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import api from "../api/axios";

export default function useLiveQueue() {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [connected, setConnected] = useState(false);

    // Fetch today's queue from SQL Server through API
    const refresh = useCallback(async () => {
        try {
            const response = await api.get("/api/queue/today");

            setQueue(response.data);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load today's queue."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let disposed = false;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(
                `${import.meta.env.VITE_API_URL}/hubs/queue`,
                {
                    accessTokenFactory: () =>
                        sessionStorage.getItem("token") || "",
                }
            )
            .withAutomaticReconnect()
            .build();

        // Listen for backend queue updates
        connection.on("QueueUpdated", () => {
            if (!disposed) {
                refresh();
            }
        });

        // When connection is restored, reload queue
        connection.onreconnected(() => {
            if (!disposed) {
                setConnected(true);
                refresh();
            }
        });

        connection.onreconnecting(() => {
            if (!disposed) {
                setConnected(false);
            }
        });

        connection.onclose(() => {
            if (!disposed) {
                setConnected(false);
            }
        });



        // Connect to SignalR
        connection.start()
            .then(() => {
                if (!disposed) {
                    setConnected(true);
                    refresh();
                }
            })
            .catch((err) => {
                if (!disposed) {
                    console.error("SignalR error:", err);
                    setConnected(false);
                }
            }).finally(() => {
                if (!disposed) {
                    refresh();
                }
            });;

        return () => {
            disposed = true;
            connection.off("QueueUpdated");
            connection.stop();
        };
    }, [refresh]);

    return {
        queue,
        loading,
        error,
        connected,
        refresh,
    };
}
