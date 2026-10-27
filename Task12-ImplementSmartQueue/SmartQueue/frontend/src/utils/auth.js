
export function getHomeRoute(role) {
    switch (role?.toLowerCase()) {
        case "admin":
        case "staff":
        case "receptionist":
            return "/employee/appointments";

        case "customer":
            return "/book";

        default:
            return "/login";
    }
}
