
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api/axios";

export default function ProtectedRoute({ allowedRoles = [] }) {
    const [auth, setAuth] = useState({
        status: "loading",
        role: null,
    });

    useEffect(() => {
        let active = true;

        async function verifyToken() {
            try {
                const response = await api.get("/api/auth/me");

                const role = response.data.role;

                if (active) {
                    setAuth({
                        status: "authenticated",
                        role,
                    });
                }
            } catch {
                if (active) {
                    sessionStorage.removeItem("token");

                    setAuth({
                        status: "unauthenticated",
                        role: null,
                    });
                }
            }
        }

        verifyToken();

        return () => {
            active = false;
        };
    }, []);

    if (auth.status === "loading") {
        return <p className="loading">Checking authentication...</p>;
    }

    if (auth.status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(auth.role)
    ) {
        return (
            <Navigate
                to={
                    auth.role === "Customer"
                        ? "/book"
                        : "/employee/appointments"
                }
                replace
            />
        );
    }

    return <Outlet />;
}
