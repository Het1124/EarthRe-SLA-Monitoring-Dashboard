
import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import StatsCards from "./components/StatsCards";
import AnalyticsCharts from "./components/AnalyticsCharts";
import LogsTable from "./components/LogsTable";
import CollapsibleSection from "./components/CollapsibleSection"; 
import UploadHistory from "./components/UploadHistory";



function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setResult(null);
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSelectedFile(null);
      setError("Please select a CSV file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    if (!API_URL) {
      setError("API URL is missing. Please check your frontend .env file.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const csvContent = await selectedFile.text();

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          csv_content: csvContent,
        }),
      });

      const data = await response.json();
      setRefreshKey((previous) => previous + 1);

      if (!response.ok) {
        throw new Error(data.error || "CSV upload failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">

        {/* Dashboard Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            SLA Monitoring Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Monitor service availability, performance and reliability.
          </p>
        </header>
        <CollapsibleSection title="Dashboard Overview">
          <StatsCards refreshKey={refreshKey} />
        </CollapsibleSection>

        <CollapsibleSection title="Service Analytics">
          <AnalyticsCharts refreshKey={refreshKey} />
        </CollapsibleSection>

        <CollapsibleSection title="Monitoring Logs">
          <LogsTable refreshKey={refreshKey} />
        </CollapsibleSection>

        <CollapsibleSection title="Upload History">
          <UploadHistory refreshKey={refreshKey} />
        </CollapsibleSection>

        {/* Upload Section */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-800">
              Upload Monitoring Data
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a CSV file to validate, process and store monitoring records.
            </p>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50">

            <Upload size={36} className="mb-3 text-blue-600" />

            <span className="font-medium text-slate-700">
              Click to select a CSV file
            </span>

            <span className="mt-1 text-sm text-slate-500">
              CSV files only
            </span>

            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Selected File */}
          {selectedFile && (
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <FileText className="text-blue-600" size={24} />

              <div className="flex-1">
                <p className="font-medium text-slate-800">
                  {selectedFile.name}
                </p>

                <p className="text-sm text-slate-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Upload size={18} />

            {loading ? "Processing CSV..." : "Upload and Process CSV"}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Successful Upload Result */}
          {result && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-5">

              <div className="mb-4 flex items-center gap-2 text-green-700">
                <CheckCircle size={22} />

                <h3 className="text-lg font-semibold">
                  CSV processed successfully!
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-slate-500">Total Rows</p>
                  <p className="mt-1 text-2xl font-bold">
                    {result.total_rows}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-slate-500">Accepted</p>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {result.accepted_rows}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-slate-500">Rejected</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {result.rejected_rows}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-slate-500">Batch ID</p>
                  <p className="mt-1 text-2xl font-bold">
                    {result.upload_batch_id}
                  </p>
                </div>

              </div>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default App;
