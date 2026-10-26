
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import BookingStepper from "../components/booking/BookingStepper";
import ServiceSelection from "../components/booking/ServiceSelection";
import StaffSelection from "../components/booking/StaffSelection";
import BookingCalendar from "../components/booking/BookingCalendar";
import TimeSlotPicker from "../components/booking/TimeSlotPicker";
import BookingSummary from "../components/booking/BookingSummary";

import "../styles/BookAppointment.css";

export default function BookAppointment() {
    const navigate = useNavigate();

    const [step, setStep] = useState(0);

    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [slots, setSlots] = useState([]);

    const [selectedService, setSelectedService] =
        useState(null);

    const [selectedStaff, setSelectedStaff] =
        useState(null);

    const [selectedDate, setSelectedDate] =
        useState("");

    const [selectedTime, setSelectedTime] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] =
        useState(false);

    const [error, setError] = useState("");
    const [bookedAppointment, setBookedAppointment] = useState(null);
    // Load active services
    useEffect(() => {
        let active = true;

        async function loadServices() {
            try {
                const response = await api.get(
                    "/api/services"
                );

                const data = response.data;

                const list = Array.isArray(data)
                    ? data
                    : data.items ?? data.services ?? [];

                if (active) {
                    setServices(
                        list.filter(
                            (service) =>
                                service.isActive !== false
                        )
                    );
                }
            } catch {
                if (active) {
                    setError(
                        "Could not load services. Please try again later."
                    );
                }
            }
        }

        loadServices();

        return () => {
            active = false;
        };
    }, []);

    // Load staff after service selection
    useEffect(() => {
        if (!selectedService) return;

        let active = true;

        async function loadStaff() {
            setError("");

            try {
                const response = await api.get(
                    "/api/users/staff"
                );

                const data = response.data;

                const list = Array.isArray(data)
                    ? data
                    : data.items ?? data.staff ?? [];

                if (active) {
                    setStaff(list);
                }
            } catch {
                if (active) {
                    setStaff([]);
                    setError(
                        "Could not load staff members."
                    );
                }
            }
        }

        loadStaff();

        return () => {
            active = false;
        };
    }, [selectedService]);

    // Load available slots
    useEffect(() => {
        if (
            !selectedService ||
            !selectedStaff ||
            !selectedDate
        ) {
            return;
        }

        let active = true;

        async function loadAvailability() {
            setSlotsLoading(true);
            setSlots([]);
            setError("");

            try {
                const response = await api.get(
                    "/api/appointments/availability",
                    {
                        params: {
                            serviceId: selectedService.id,
                            staffId: selectedStaff.id,
                            date: selectedDate,
                        },
                    }
                );

                const data = response.data;

                const list = Array.isArray(data)
                    ? data
                    : data.slots ??
                    data.availableSlots ??
                    [];

                if (active) {
                    setSlots(list);
                }
            } catch {
                if (active) {
                    setError(
                        "Could not load available times."
                    );
                }
            } finally {
                if (active) {
                    setSlotsLoading(false);
                }
            }
        }

        loadAvailability();

        return () => {
            active = false;
        };
    }, [
        selectedService,
        selectedStaff,
        selectedDate,
    ]);


    function chooseService(service) {
        setSelectedService(service);
        setSelectedStaff(null);
        setSelectedDate("");
        setSelectedTime("");
        setStaff([]);
        setSlots([]);
        setError("");
    }

    function chooseStaff(member) {
        setSelectedStaff(member);
        setSelectedDate("");
        setSelectedTime("");
        setSlots([]);
        setError("");
    }

    function chooseDate(date) {
        setSelectedDate(date);
        setSelectedTime("");
        setSlots([]);
        setError("");
    }


    function canContinue() {
        if (step === 0) {
            return Boolean(selectedService);
        }

        if (step === 1) {
            return Boolean(selectedStaff);
        }

        if (step === 2) {
            return Boolean(
                selectedDate && selectedTime
            );
        }

        return Boolean(
            selectedService &&
            selectedStaff &&
            selectedDate &&
            selectedTime
        );
    }

    async function handleContinue() {
        setError("");

        if (!canContinue()) return;

        if (step < 3) {
            setStep(step + 1);
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/api/appointments", {
                serviceId: selectedService.id,
                staffId: selectedStaff.id,
                date: selectedDate,
                startTime: selectedTime,
            });

            setBookedAppointment(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Booking failed. The selected time may no longer be available."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleBack() {
        setError("");
        setStep((previous) =>
            Math.max(previous - 1, 0)
        );
    }

    if (bookedAppointment) {
        return (
            <div className="book-page">
                <div className="booking-receipt-page">
                    <div className="booking-receipt">
                        <div className="receipt-check">✓</div>

                        <h1>Booking received!</h1>

                        <p className="receipt-description">
                            Your appointment has been submitted
                            and is waiting for confirmation.
                        </p>

                        <div className="receipt-card">
                            <div className="receipt-reference">
                                <span>Booking reference</span>

                                <h2>{bookedAppointment.reference}</h2>

                                <p>
                                    Keep this reference for your appointment.
                                </p>
                            </div>

                            <div className="receipt-row">
                                <span>Service</span>
                                <strong>{selectedService.name}</strong>
                            </div>

                            <div className="receipt-row">
                                <span>Staff</span>
                                <strong>
                                    {selectedStaff.fullName ||
                                        selectedStaff.name ||
                                        selectedStaff.email}
                                </strong>
                            </div>

                            <div className="receipt-row">
                                <span>Date</span>
                                <strong>{selectedDate}</strong>
                            </div>

                            <div className="receipt-row">
                                <span>Time</span>
                                <strong>
                                    {selectedTime}
                                    {" - "}
                                    {bookedAppointment.end?.slice(11, 16)}
                                </strong>
                            </div>

                            <div className="receipt-row">
                                <span>Price</span>
                                <strong>
                                    ${Number(
                                        bookedAppointment.price ??
                                        selectedService.price
                                    ).toFixed(2)}
                                </strong>
                            </div>

                            <div className="receipt-row">
                                <span>Status</span>

                                <span
                                    className={`receipt-status ${bookedAppointment.status?.toLowerCase() || "pending"}`}
                                >
                                    {bookedAppointment.status || "Pending"}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="receipt-button"
                            onClick={() => navigate("/my-appointments")}
                        >
                            View my appointments
                        </button>

                        <p className="receipt-footer">
                            You can check your appointment status
                            anytime from My Appointments.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="book-page">


            <main className="booking-container">
                <div className="booking-page-heading">
                    <h1>Book an appointment</h1>

                    <p>
                        Pick a time that works for you.
                        You can reschedule later from
                        My appointments.
                    </p>
                </div>

                <BookingStepper currentStep={step} />

                {error && (
                    <div className="booking-error">
                        {error}
                    </div>
                )}

                <div className="booking-layout">
                    <section className="booking-main-card">
                        {step === 0 && (
                            <>
                                <div className="booking-section-heading">
                                    <h2>Choose a service</h2>
                                    <p>
                                        Select the service you need.
                                    </p>
                                </div>

                                <ServiceSelection
                                    services={services}
                                    selectedService={selectedService}
                                    onSelect={chooseService}
                                />
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <div className="booking-section-heading">
                                    <h2>Choose a staff member</h2>
                                    <p>
                                        Select who will provide
                                        your service.
                                    </p>
                                </div>

                                <StaffSelection
                                    staff={staff}
                                    selectedStaff={selectedStaff}
                                    onSelect={chooseStaff}
                                />
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="booking-section-heading">
                                    <h2>Choose a date and time</h2>
                                    <p>
                                        Select an available
                                        appointment slot.
                                    </p>
                                </div>

                                <div className="booking-date-layout">
                                    <BookingCalendar
                                        selectedDate={selectedDate}
                                        onSelectDate={chooseDate}
                                    />

                                    <TimeSlotPicker
                                        slots={slots}
                                        selectedTime={selectedTime}
                                        onSelectTime={setSelectedTime}
                                        loading={slotsLoading}
                                    />
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <div className="booking-confirm">
                                <div className="confirm-icon">✓</div>

                                <h2>Confirm your appointment</h2>

                                <p>
                                    Please review your booking
                                    details before confirming.
                                </p>

                                <div className="confirm-note">
                                    Your appointment will be
                                    submitted when you click
                                    Confirm booking.
                                </div>
                            </div>
                        )}
                    </section>

                    <BookingSummary
                        service={selectedService}
                        staff={selectedStaff}
                        date={selectedDate}
                        time={selectedTime}
                        currentStep={step}
                        onContinue={handleContinue}
                        onBack={handleBack}
                        loading={loading}
                        disabled={!canContinue()}
                    />
                </div>
            </main>
        </div>
    );
}
