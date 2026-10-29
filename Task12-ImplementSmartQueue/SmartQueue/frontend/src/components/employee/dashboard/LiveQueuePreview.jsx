
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Users } from "lucide-react";

const numberOf = (item) =>
    `A-${String(item.queueNumber).padStart(3, "0")}`;

export default function LiveQueuePreview({
    queue = [],
    loading = false
}) {
    const staffCards = useMemo(() => {
        const active = queue.filter(item =>
            ["CheckedIn", "InProgress"].includes(item.status)
        );

        const names = [
            ...new Set(active.map(item => item.staffName))
        ];

        return names.map((name, index) => ({
            name,
            room: `Room ${index + 1}`,
            current: active.find(item =>
                item.staffName === name &&
                item.status === "InProgress"
            ),
            next: active.find(item =>
                item.staffName === name &&
                item.status === "CheckedIn"
            )
        }));
    }, [queue]);

    const waitingCount = queue.filter(
        item => item.status === "CheckedIn"
    ).length;

    return (
        <section className="dashboard-panel dashboard-queue-panel">
            <div className="dashboard-panel-header">
                <div>
                    <h2>Live queue</h2>
                    <p>
                        <Users size={13} />
                        {loading ? "Loading..." : `${waitingCount} waiting`}
                    </p>
                </div>

                <Link to="/employee/queue" className="dashboard-panel-link">
                    Open queue <ArrowUpRight size={15} />
                </Link>
            </div>

            {loading ? (
                <div className="dashboard-queue-loading">
                    {[1, 2].map(item => (
                        <div
                            className="dashboard-skeleton"
                            key={item}
                        />
                    ))}
                </div>
            ) : staffCards.length === 0 ? (
                <div className="dashboard-empty">
                    No active queue right now.
                </div>
            ) : (
                <div className="dashboard-queue-list">
                    {staffCards.map(staff => (
                        <div
                            className="dashboard-queue-staff"
                            key={staff.name}
                        >
                            <div className="dashboard-queue-room">
                                <strong>{staff.room}</strong>
                                <span>{staff.name}</span>
                            </div>

                            {staff.current ? (
                                <div className="dashboard-queue-current">
                                    <span className="dashboard-queue-number">
                                        {numberOf(staff.current)}
                                    </span>

                                    <div>
                                        <strong>
                                            {staff.current.customerName}
                                        </strong>
                                        <small>In service</small>
                                    </div>
                                </div>
                            ) : (
                                <span className="dashboard-queue-free">
                                    Available
                                </span>
                            )}

                            {staff.next && (
                                <div className="dashboard-queue-next">
                                    <span>Next</span>
                                    <strong>
                                        {numberOf(staff.next)}
                                    </strong>
                                    <span>{staff.next.customerName}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
