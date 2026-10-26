
const steps = [
    "Service",
    "Staff",
    "Date & time",
    "Confirm",
];

export default function BookingStepper({ currentStep }) {
    return (
        <div className="booking-stepper">
            {steps.map((step, index) => (
                <div
                    className={`booking-step ${index === currentStep ? "active" : ""
                        } ${index < currentStep ? "completed" : ""}`}
                    key={step}
                >
                    <span className="step-number">
                        {index < currentStep ? "✓" : index + 1}
                    </span>

                    <span className="step-label">{step}</span>

                    {index < steps.length - 1 && (
                        <span className="step-line" />
                    )}
                </div>
            ))}
        </div>
    );
}
