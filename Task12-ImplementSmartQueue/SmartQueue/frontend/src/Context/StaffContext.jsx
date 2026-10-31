
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

import api from "../api/axios";

const StaffContext = createContext(null);

export function StaffProvider({ children }) {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/users/staff");
            setStaff(response.data);
            return response.data;
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load staff members."
            );
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStaff = useCallback(async (id, data) => {
        const response = await api.put(
            `/api/users/staff/${encodeURIComponent(id)}`,
            data
        );

        setStaff((previous) =>
            previous.map((member) =>
                member.id === id ? response.data : member
            )
        );

        return response.data;
    }, []);

    const createStaff = useCallback(async (data) => {
        const response = await api.post("/api/users/staff", data);

        setStaff((previous) => [...previous, response.data]);

        return response.data;
    }, []);

    const getStaffSchedule = useCallback(async (staffId) => {
        const response = await api.get(
            `/api/staff/${encodeURIComponent(staffId)}/schedule`
        );

        return response.data;
    }, []);



    const updateStaffSchedule = useCallback(
        async (staffId, data) => {
            const response = await api.put(
                `/api/staff/${encodeURIComponent(staffId)}/schedule`,
                data
            );

            return response.data;
        },
        []
    );

    const value = useMemo(
        () => ({
            staff,
            loading,
            error,
            fetchStaff,
            createStaff,
            getStaffSchedule,
            updateStaffSchedule,
            updateStaff,
        }),
        [
            staff,
            loading,
            error,
            fetchStaff,
            createStaff,
            getStaffSchedule,
            updateStaffSchedule,
            updateStaff,
        ]
    );

    return (
        <StaffContext.Provider value={value}>
            {children}
        </StaffContext.Provider>
    );
}

export function useStaff() {
    const context = useContext(StaffContext);

    if (!context) {
        throw new Error(
            "useStaff must be used inside StaffProvider"
        );
    }

    return context;
}
