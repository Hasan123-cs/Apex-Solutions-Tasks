
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Dashboard.css";
export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        let active = true;

        async function loadUser() {
            try {
                const response = await api.get("/api/auth/me");

                if (active) setUser(response.data);
            } catch {
                sessionStorage.removeItem("token");
                navigate("/login", { replace: true });
            }
        }

        loadUser();

        return () => {
            active = false;
        };
    }, [navigate]);

    // function handleLogout() {
    //     sessionStorage.removeItem("token");
    //     navigate("/login", { replace: true });
    // }

    return (
        <div className="dashboard">


            <main className="dashboard-content">
                <h2>Welcome, {user?.name || "Customer"}!</h2>
                <p>Role: {user?.role || "Loading..."}</p>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>My Appointments</h3>
                        <p>View and manage your bookings.</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Book Appointment</h3>
                        <p>Choose a service and available time.</p>
                    </div>

                    <div className="dashboard-card">
                        <h3>Queue Status</h3>
                        <p>Track your position in the queue.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
