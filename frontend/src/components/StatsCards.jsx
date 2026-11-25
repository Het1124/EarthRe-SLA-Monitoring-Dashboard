
import { useEffect, useState } from "react";

import {
  Activity,
  Server,
  CheckCircle,
  Clock,
  Upload,
  AlertTriangle,
} from "lucide-react";


function StatsCards({ refreshKey })  {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {

    const fetchStats = async () => {

      try {

        if (!BACKEND_URL) {
          throw new Error("Backend URL is missing in .env");
        }

        const response = await fetch(
          `${BACKEND_URL}/api/dashboard/summary`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard statistics.");
        }

        const data = await response.json();

        setStats(data);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    fetchStats();

  }, [BACKEND_URL, refreshKey]);


  const cards = [
    {
      title: "Total Checks",
      value: stats?.total_checks,
      icon: Activity,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Total Services",
      value: stats?.total_services,
      icon: Server,
      color: "text-purple-600",
      background: "bg-purple-50",
    },
    {
      title: "Availability",
      value: `${stats?.availability_percentage}%`,
      icon: CheckCircle,
      color: "text-green-600",
      background: "bg-green-50",
    },
    {
      title: "Average Latency",
      value: `${stats?.average_latency_ms} ms`,
      icon: Clock,
      color: "text-orange-600",
      background: "bg-orange-50",
    },
    {
      title: "Total Uploads",
      value: stats?.total_uploads,
      icon: Upload,
      color: "text-indigo-600",
      background: "bg-indigo-50",
    },
    {
      title: "Rejected Records",
      value: stats?.total_rejected,
      icon: AlertTriangle,
      color: "text-red-600",
      background: "bg-red-50",
    },
  ];


  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        Loading dashboard statistics...
      </div>
    );
  }


  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-red-700">
        Unable to load dashboard statistics: {error}
      </div>
    );
  }


  return (

    <section className="mb-8">

      <h2 className="mb-4 text-xl font-semibold text-slate-800">
        Dashboard Overview
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {cards.map((card) => {

          const Icon = card.icon;

          return (

            <div
              key={card.title}
              className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>

                </div>

                <div className={`rounded-lg p-3 ${card.background}`}>

                  <Icon size={24} className={card.color} />

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </section>

  );

}

export default StatsCards;
