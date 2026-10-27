
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";

import "../../styles/EmployeeLayout.css";

export default function EmployeeLayout() {
    return (
        <div className="employee-layout">
            <EmployeeSidebar />

            <main className="employee-layout-content">
                <Outlet />
            </main>
        </div>
    );
}
