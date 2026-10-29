
import { useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell
} from "recharts";

const formatDay = (date) => {
    return new Date(`${date}T12:00:00Z`)
        .toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC"
        });
};

function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;

    const item = payload[0].payload;

    return (
        <div className="dashboard-chart-tooltip">
            <strong>{item.date}</strong>
            <span>Total: {item.totalAppointments}</span>
            <span>Completed: {item.completedAppointments}</span>
        </div>
    );
}

export default function AppointmentsChart({
    data = [],
    loading = false
}) {
    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            label: formatDay(item.date)
        }));
    }, [data]);

    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Beirut",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    return (
        <section className="dashboard-panel dashboard-chart-panel">
            <div className="dashboard-panel-header">
                <div>
                    <h2>Appointments</h2>
                    <p>Daily appointment volume</p>
                </div>

                <div className="dashboard-chart-legend">
                    <span className="dashboard-legend-dot" />
                    Total appointments
                </div>
            </div>

            {loading ? (
                <div className="dashboard-chart-loading">
                    <div className="dashboard-skeleton" />
                </div>
            ) : chartData.length === 0 ? (
                <div className="dashboard-empty">
                    No appointment data available.
                </div>
            ) : (
                <div className="dashboard-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 8,
                                left: -20,
                                bottom: 0
                            }}
                        >
                            <CartesianGrid
                                stroke="#edf1f5"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#8290a6", fontSize: 12 }}
                            />

                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#8290a6", fontSize: 12 }}
                            />

                            <Tooltip
                                content={<ChartTooltip />}
                                cursor={{ fill: "#f0f6f7" }}
                            />

                            <Bar
                                dataKey="totalAppointments"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={42}
                            >
                                {chartData.map((item, index) => (
                                    <Cell
                                        key={`${item.date}-${index}`}
                                        fill={
                                            item.date === today
                                                ? "#087f84"
                                                : "#9dd6d8"
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}
