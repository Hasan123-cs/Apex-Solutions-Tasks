
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    CalendarDays,
    Stethoscope,
    Users,
    LogOut,
    ListFilter,
    ListOrdered,
} from "lucide-react";

import "../../styles/EmployeeSidebar.css";

export default function EmployeeSidebar() {
    const navigate = useNavigate();

    const role = sessionStorage.getItem("role") || "";
    const fullName =
        sessionStorage.getItem("fullName") || "Employee";

    const isAdmin = role === "Admin";
    const canAccessQueue = ["Admin", "Receptionist", "Staff"].includes(role);

    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const navClass = ({ isActive }) =>
        `employee-nav-link${isActive ? " active" : ""}`;

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("fullName");
        sessionStorage.removeItem("email");

        navigate("/login", { replace: true });
    };

    return (
        <aside className="employee-sidebar">
            <div className="employee-sidebar-brand">
                <div className="employee-brand-icon">
                    <ListFilter size={18} />
                </div>
                <span>TeamFlow</span>
            </div>

            <nav className="employee-sidebar-nav">
                {isAdmin && (
                    <div className="employee-nav-group">
                        <p className="employee-nav-heading">Overview</p>

                        <NavLink
                            to="/employee/dashboard"
                            className={navClass}
                        >
                            <LayoutDashboard size={17} />
                            <span>Dashboard</span>
                        </NavLink>
                    </div>
                )}

                <div className="employee-nav-group">
                    <p className="employee-nav-heading">
                        Operations
                    </p>

                    <NavLink
                        to="/employee/appointments"
                        className={navClass}
                    >
                        <CalendarDays size={17} />
                        <span>Appointments</span>
                    </NavLink>

                    {canAccessQueue && (
                        <NavLink
                            to="/employee/queue"
                            className={navClass}
                        >
                            <ListOrdered size={17} />
                            <span>Live Queue</span>
                        </NavLink>
                    )}
                </div>

                {isAdmin && (
                    <div className="employee-nav-group">
                        <p className="employee-nav-heading">Setup</p>

                        <NavLink
                            to="/employee/services"
                            className={navClass}
                        >
                            <Stethoscope size={17} />
                            <span>Services</span>
                        </NavLink>

                        <NavLink
                            to="/employee/staff"
                            className={navClass}
                        >
                            <Users size={17} />
                            <span>Staff</span>
                        </NavLink>
                    </div>
                )}
            </nav>

            <div className="employee-sidebar-footer">
                <div className="employee-avatar">
                    {initials}
                </div>

                <div className="employee-user-info">
                    <strong>{fullName}</strong>
                    <span>{role}</span>
                </div>

                <button
                    type="button"
                    className="employee-logout-button"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <LogOut size={17} />
                </button>
            </div>
        </aside>
    );
}
