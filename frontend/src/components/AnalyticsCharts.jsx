
import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


function AnalyticsCharts({ refreshKey }) {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {

    const fetchAnalytics = async () => {

      try {

        const response = await fetch(
          `${BACKEND_URL}/api/dashboard/analytics`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch analytics.");
        }

        const data = await response.json();

        setServices(data.services);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    fetchAnalytics();

  }, [BACKEND_URL, refreshKey]);


  if (loading) {
    return <p className="text-slate-500">Loading charts...</p>;
  }


  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }


  return (

    <section className="mb-8">

      <h2 className="mb-4 text-xl font-semibold text-slate-800">
        Service Analytics
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Availability Chart */}
        <div className="rounded-xl bg-white p-5 shadow-sm">

          <h3 className="mb-1 text-lg font-semibold text-slate-800">
            Availability by Service
          </h3>

          <p className="mb-4 text-sm text-slate-500">
            Successful HTTP 2xx responses (%)
          </p>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={services}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="service_id" />

              <YAxis domain={[0, 100]} />

              <Tooltip
                formatter={(value) => [`${value}%`, "Availability"]}
              />

              <Bar
                dataKey="availability_percentage"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* Latency Chart */}
        <div className="rounded-xl bg-white p-5 shadow-sm">

          <h3 className="mb-1 text-lg font-semibold text-slate-800">
            Average Latency by Service
          </h3>

          <p className="mb-4 text-sm text-slate-500">
            Average response time (milliseconds)
          </p>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={services}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="service_id" />

              <YAxis />

              <Tooltip
                formatter={(value) => [`${value} ms`, "Average Latency"]}
              />

              <Bar
                dataKey="average_latency_ms"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </section>

  );

}

export default AnalyticsCharts;
