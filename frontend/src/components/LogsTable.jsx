
import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

function LogsTable({ refreshKey }) {

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [logs, setLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [statusCode, setStatusCode] = useState("");

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 10;


  useEffect(() => {

    const fetchLogs = async () => {

      setLoading(true);
      setError("");

      try {

        if (!BACKEND_URL) {
          throw new Error("Backend URL is missing.");
        }

        const params = new URLSearchParams();

        params.append("limit", limit);
        params.append("offset", page * limit);

        if (dateFrom) {
          params.append("date_from", dateFrom);
        }

        if (dateTo) {
          params.append("date_to", dateTo);
        }

        if (serviceId) {
          params.append("service_id", serviceId);
        }

        if (statusCode) {
          params.append("status_code", statusCode);
        }

        const response = await fetch(
          `${BACKEND_URL}/api/dashboard/logs?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch monitoring logs."
          );
        }

        setLogs(data.logs);
        setTotalRecords(data.total_records);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    fetchLogs();

    }, [
    BACKEND_URL,
    page,
    dateFrom,
    dateTo,
    serviceId,
    statusCode,
    refreshKey
  ]);

  const resetFilters = () => {

    setDateFrom("");
    setDateTo("");
    setServiceId("");
    setStatusCode("");
    setPage(0);

  };


  const totalPages = Math.ceil(totalRecords / limit);


  return (

    <section className="mb-8 rounded-xl bg-white p-5 shadow-sm">

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Monitoring Logs
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and filter individual service monitoring records.
          </p>
        </div>

        <button
          onClick={resetFilters}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Reset Filters
        </button>

      </div>


      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            From Date
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
          />
        </div>


        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            To Date
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
          />
        </div>


        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Service
          </label>

          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
          >
            <option value="">All Services</option>
            <option value="svc-auth">svc-auth</option>
            <option value="svc-notify">svc-notify</option>
            <option value="svc-payments">svc-payments</option>
            <option value="svc-reports">svc-reports</option>
            <option value="svc-search">svc-search</option>
          </select>
        </div>


        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            HTTP Status
          </label>

          <select
            value={statusCode}
            onChange={(e) => {
              setStatusCode(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="200">200</option>
            <option value="201">201</option>
            <option value="400">400</option>
            <option value="404">404</option>
            <option value="500">500</option>
            <option value="503">503</option>
          </select>
        </div>

      </div>


      {/* Record count */}
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Search size={16} />
        {totalRecords.toLocaleString()} matching records
      </div>


      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[850px] text-left text-sm">

          <thead className="bg-slate-50 text-slate-600">

            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Service</th>
              <th className="p-3">Status</th>
              <th className="p-3">Latency</th>
              <th className="p-3">Agent</th>
              <th className="p-3">Region</th>
              <th className="p-3">Quality Flags</th>
            </tr>

          </thead>


          <tbody className="divide-y divide-slate-100">

            {loading ? (

              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  Loading monitoring records...
                </td>
              </tr>

            ) : logs.length === 0 ? (

              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-500">
                  No monitoring records found.
                </td>
              </tr>

            ) : (

              logs.map((log) => (

                <tr key={log.id} className="hover:bg-slate-50">

                  <td className="whitespace-nowrap p-3 text-slate-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="p-3 font-medium text-slate-800">
                    {log.service_id}
                  </td>

                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      log.status_code >= 200 && log.status_code < 300
                        ? "bg-green-100 text-green-700"
                        : log.status_code >= 500
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {log.status_code}
                    </span>
                  </td>

                  <td className="p-3 text-slate-600">
                    {log.latency_ms !== null
                      ? `${log.latency_ms} ms`
                      : "N/A"}
                  </td>

                  <td className="p-3 text-slate-600">
                    {log.agent || "N/A"}
                  </td>

                  <td className="p-3 text-slate-600">
                    {log.region || "N/A"}
                  </td>

                  <td className="p-3 text-slate-600">
                    {log.quality_flags || "—"}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* Pagination */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

        <p className="text-sm text-slate-500">
          Showing {totalRecords === 0 ? 0 : page * limit + 1}
          {" "}to{" "}
          {Math.min((page + 1) * limit, totalRecords)}
          {" "}of {totalRecords.toLocaleString()} records
        </p>


        <div className="flex items-center gap-3">

          <button
            onClick={() => setPage((previous) => previous - 1)}
            disabled={page === 0 || loading}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>


          <span className="text-sm text-slate-600">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
          </span>


          <button
            onClick={() => setPage((previous) => previous + 1)}
            disabled={page + 1 >= totalPages || loading}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>

        </div>

      </div>

    </section>

  );

}

export default LogsTable;
