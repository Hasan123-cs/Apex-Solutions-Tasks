
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/axios";

export default function ProtectedRoute() {
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let active = true;

        async function verifyToken() {
            try {
                await api.get("/api/auth/me");

                if (active) setStatus("authenticated");
            } catch {
                sessionStorage.removeItem("token");

                if (active) setStatus("unauthenticated");
            }
        }

        verifyToken();

        return () => {
            active = false;
        };
    }, []);

    if (status === "loading") {
        return <p className="loading">Checking authentication...</p>;
    }

    if (status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
