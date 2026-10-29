
import {
    CalendarDays,
    CircleCheck,
    CalendarX,
    Hourglass,
    Wallet
} from "lucide-react";

const cards = [
    {
        key: "totalAppointments",
        title: "Appointments",
        icon: CalendarDays
    },
    {
        key: "completedAppointments",
        title: "Completed",
        icon: CircleCheck
    },
    {
        key: "cancelledAppointments",
        title: "Cancelled",
        icon: CalendarX
    },
    {
        key: "waitingNow",
        title: "Waiting now",
        icon: Hourglass
    },
    {
        key: "estimatedRevenue",
        title: "Est. revenue",
        icon: Wallet
    }
];

export default function DashboardStats({ stats, loading }) {
    return (
        <section className="dashboard-stats">
            {cards.map(({ key, title, icon: Icon }) => (
                <article className="dashboard-stat-card" key={key}>
                    <div className="dashboard-stat-label">
                        <Icon size={15} strokeWidth={1.7} />
                        <span>{title}</span>
                    </div>

                    {loading || !stats ? (
                        <>
                            <div className="dashboard-skeleton dashboard-skeleton-value" />
                            <div className="dashboard-skeleton dashboard-skeleton-subtitle" />
                        </>
                    ) : (
                        <>
                            <strong className="dashboard-stat-value">
                                {key === "estimatedRevenue"
                                    ? `$${Number(stats[key] ?? 0).toLocaleString(
                                        "en-US",
                                        { maximumFractionDigits: 2 }
                                    )}`
                                    : Number(stats[key] ?? 0).toLocaleString()}
                            </strong>

                            <span className="dashboard-stat-subtitle">
                                {key === "estimatedRevenue"
                                    ? "From completed visits today"
                                    : key === "waitingNow"
                                        ? "Currently checked in"
                                        : "Selected period"}
                            </span>
                        </>
                    )}
                </article>
            ))}
        </section>
    );
}
