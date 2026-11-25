
import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";


function UploadHistory({ refreshKey }) {

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [uploads, setUploads] = useState([]);
  const [totalUploads, setTotalUploads] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);

  const limit = 10;


  useEffect(() => {

    const fetchUploads = async () => {

      setLoading(true);
      setError("");

      try {

        const response = await fetch(
          `${BACKEND_URL}/api/dashboard/uploads?limit=${limit}&offset=${page * limit}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch upload history."
          );
        }

        setUploads(data.uploads);
        setTotalUploads(data.total_uploads);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    fetchUploads();

 }, [BACKEND_URL, page, refreshKey]);


  const totalPages = Math.ceil(totalUploads / limit);


  const formatDate = (value) => {

    if (!value) return "N/A";

    return new Date(value).toLocaleString();

  };


  const getStatusStyle = (status) => {

    switch (status?.toLowerCase()) {

      case "completed":
        return "bg-green-100 text-green-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-700";

    }

  };


  return (

    <section className="mb-8 rounded-xl bg-white p-5 shadow-sm">

      <div className="mb-5 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold text-slate-800">
            Upload History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Previously uploaded CSV files and processing results.
          </p>

        </div>

        <FileSpreadsheet
          size={25}
          className="text-blue-600"
        />

      </div>


      <div className="mb-4 text-sm text-slate-500">
        Total uploads: {totalUploads.toLocaleString()}
      </div>


      {error && (

        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>

      )}


      <div className="overflow-x-auto">

        <table className="w-full min-w-[850px] text-left text-sm">

          <thead className="bg-slate-50 text-slate-600">

            <tr>

              <th className="p-3">Filename</th>
              <th className="p-3">Uploaded At</th>
              <th className="p-3">Total Rows</th>
              <th className="p-3">Accepted</th>
              <th className="p-3">Rejected</th>
              <th className="p-3">Status</th>

            </tr>

          </thead>


          <tbody className="divide-y divide-slate-100">

            {loading ? (

              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  Loading upload history...
                </td>
              </tr>

            ) : uploads.length === 0 ? (

              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  No uploads found.
                </td>
              </tr>

            ) : (

              uploads.map((upload) => (

                <tr
                  key={upload.id}
                  className="hover:bg-slate-50"
                >

                  <td className="p-3">

                    <div className="flex items-center gap-2">

                      <FileSpreadsheet
                        size={17}
                        className="text-green-600"
                      />

                      <span className="font-medium text-slate-800">
                        {upload.filename}
                      </span>

                    </div>

                  </td>


                  <td className="whitespace-nowrap p-3 text-slate-600">
                    {formatDate(upload.uploaded_at)}
                  </td>


                  <td className="p-3 text-slate-700">
                    {upload.total_rows}
                  </td>


                  <td className="p-3">

                    <span className="flex items-center gap-1 text-green-700">

                      <CheckCircle size={15} />

                      {upload.accepted_rows}

                    </span>

                  </td>


                  <td className="p-3">

                    <span className="flex items-center gap-1 text-red-600">

                      <AlertTriangle size={15} />

                      {upload.rejected_rows}

                    </span>

                  </td>


                  <td className="p-3">

                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(upload.status)}`}>
                      {upload.status}
                    </span>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

        <p className="text-sm text-slate-500">

          Showing {totalUploads === 0 ? 0 : page * limit + 1}
          {" "}to{" "}
          {Math.min((page + 1) * limit, totalUploads)}
          {" "}of {totalUploads} uploads

        </p>


        <div className="flex items-center gap-3">

          <button
            onClick={() => setPage((previous) => previous - 1)}
            disabled={page === 0 || loading}
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
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
            className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>

        </div>

      </div>

    </section>

  );

}

export default UploadHistory;
