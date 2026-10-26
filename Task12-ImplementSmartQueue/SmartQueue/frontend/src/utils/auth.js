
export function getHomeRoute(role) {
    switch (role?.toLowerCase()) {
        case "admin":
            return "/dashboard";

        case "staff":
        case "receptionist":
            return "/appointments";

        case "customer":
            return "/book";

        default:
            return "/login";
    }
}
