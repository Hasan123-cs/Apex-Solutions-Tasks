import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/CustomerNavbar.css";

export default function CustomerNavbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadUser() {
            try {
                const response = await api.get("/api/auth/me");

                if (active) {
                    setUser(response.data);
                }
            } catch (error) {
                console.error("Failed to load user", error);
            }
        }

        loadUser();

        return () => {
            active = false;
        };
    }, []);

    function handleLogout() {
        sessionStorage.removeItem("token");
        navigate("/login", { replace: true });
    }

    const name = user?.name || user?.fullName || "Customer";

    const initials = name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <header className="customer-navbar">
            <NavLink to="/dashboard" className="customer-brand">
                <span className="customer-brand-icon">☷</span>
                <strong>TeamFlow</strong>
            </NavLink>

            <nav className="customer-nav-links">
                <NavLink
                    to="/book"
                    className={({ isActive }) =>
                        `customer-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    Book appointment
                </NavLink>

                <NavLink
                    to="/my-appointments"
                    className={({ isActive }) =>
                        `customer-nav-link ${isActive ? "active" : ""}`
                    }
                >
                    My appointments
                </NavLink>
            </nav>

            <div className="customer-nav-actions">
                <button
                    type="button"
                    className="customer-notification"
                    title="Notifications (coming soon)"
                    disabled
                >
                    ♧
                </button>

                <div className="customer-profile">
                    <button
                        type="button"
                        className="customer-profile-button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                    >
                        <span className="customer-avatar">
                            {initials}
                        </span>

                        <span className="customer-name">
                            {name}
                        </span>

                        <span>⌄</span>
                    </button>

                    {menuOpen && (
                        <div className="customer-profile-menu">
                            <button
                                type="button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}