
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { useServices } from "../Context/ServicesContext";

import ServicesTable from "../components/employee/services/ServicesTable";
import ServiceModal from "../components/employee/services/ServiceModal";

import "../styles/Services.css";

export default function Services() {
    const {
        services,
        loading,
        error,
        setError,
        createService,
        updateService,
        toggleServiceStatus
    } = useServices();

    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalService, setModalService] = useState(null);

    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    // Count inactive services
    const inactiveCount = services.filter(
        service => !service.isActive
    ).length;

    // Search + Show inactive filter
    const filteredServices = useMemo(() => {
        const term = search.trim().toLowerCase();

        return services.filter(service => {
            const matchesSearch =
                service.name.toLowerCase().includes(term) ||
                (service.description || "")
                    .toLowerCase()
                    .includes(term);

            const matchesStatus =
                showInactive || service.isActive;

            return matchesSearch && matchesStatus;
        });
    }, [services, search, showInactive]);

    function openCreate() {
        setModalService(null);
        setModalOpen(true);
    }

    function openEdit(service) {
        setModalService(service);
        setModalOpen(true);
    }

    async function handleSave(form) {
        setSaving(true);

        try {
            if (modalService) {
                await updateService(modalService.id, form);
            } else {
                await createService(form);
            }

            setModalOpen(false);
            setModalService(null);
        } finally {
            setSaving(false);
        }
    }

    async function handleToggle(service) {
        setUpdatingId(service.id);
        setError("");

        try {
            await toggleServiceStatus(service);
        } catch {
            setError("Failed to update service status.");
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="services-page">
            <div className="services-toolbar">
                <div className="services-heading">
                    <h1>Services</h1>

                    <span>
                        {loading
                            ? "Loading..."
                            : `${services.length} services, ${inactiveCount} inactive`}
                    </span>
                </div>

                <div className="services-actions">
                    <div className="services-search">
                        <Search size={17} />

                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search services"
                        />
                    </div>

                    <label className="services-filter">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={e => setShowInactive(e.target.checked)}
                        />

                        <span className="services-switch" />
                        Show inactive
                    </label>

                    <button
                        className="services-new-button"
                        onClick={openCreate}
                    >
                        <Plus size={17} />
                        New service
                    </button>
                </div>
            </div>

            <div className="services-content">
                {error && (
                    <div className="services-error">
                        {error}
                    </div>
                )}

                <ServicesTable
                    services={filteredServices}
                    loading={loading}
                    updatingId={updatingId}
                    onEdit={openEdit}
                    onToggle={handleToggle}
                />

                <p className="services-note">
                    Inactive services can't be booked.
                    Past appointments keep their service details.
                </p>
            </div>

            {modalOpen && (
                <ServiceModal
                    service={modalService}
                    saving={saving}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
