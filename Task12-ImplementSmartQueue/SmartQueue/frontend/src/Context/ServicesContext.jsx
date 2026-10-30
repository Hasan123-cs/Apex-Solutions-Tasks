
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../api/axios";

const ServicesContext = createContext(null);

export function ServicesProvider({ children }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/api/services/admin");
            setServices(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load services."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const createService = async (data) => {
        const response = await api.post("/api/services", data);

        setServices(previous => [...previous, response.data]);

        return response.data;
    };

    const updateService = async (id, data) => {
        const response = await api.put(`/api/services/${id}`, data);

        setServices(previous =>
            previous.map(service =>
                service.id === id ? response.data : service
            )
        );

        return response.data;
    };

    const toggleServiceStatus = async (service) => {
        const response = await api.patch(
            `/api/services/${service.id}/status`,
            { isActive: !service.isActive }
        );

        setServices(previous =>
            previous.map(item =>
                item.id === service.id ? response.data : item
            )
        );

        return response.data;
    };

    return (
        <ServicesContext.Provider
            value={{
                services,
                loading,
                error,
                setError,
                fetchServices,
                createService,
                updateService,
                toggleServiceStatus
            }}
        >
            {children}
        </ServicesContext.Provider>
    );
}

export function useServices() {
    const context = useContext(ServicesContext);

    if (!context) {
        throw new Error(
            "useServices must be used inside ServicesProvider"
        );
    }

    return context;
}
