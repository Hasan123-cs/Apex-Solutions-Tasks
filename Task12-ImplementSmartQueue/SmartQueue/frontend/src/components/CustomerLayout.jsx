import { Outlet } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";

export default function CustomerLayout() {
    return (
        <>
            <CustomerNavbar />
            <Outlet />
        </>
    );
}