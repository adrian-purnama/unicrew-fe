// src/pages/admin/AdminReviewsPage.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";


function fmtDate(d) {
  try { return new Date(d).toLocaleString(); } catch { return "—"; }
}

export default function AdminReviewsPage() {
  const [q, setQ] = useState("");
  const [minRating, setMinRating] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchRows = async (p = 1) => {
    setLoading(true);
    try {
      const params = { q, page: p, limit: 20 };
      if (minRating) params.minRating = minRating;
      const { data } = await axiosInstance.get("/admin/reviews", { params });
      setRows(data.items || []);
      setPage(data.page);
      setPages(data.pages);
    } catch (e) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(1); }, []);

  const del = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await axiosInstance.delete(`/admin/reviews/${id}`);
      toast.success("Deleted");
      fetchRows(page);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-color-1 min-h-screen text-color">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Reviews</h1>

        <div className="flex gap-2 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search comment / reviewer / reviewee"
            className="border border-gray p-2 rounded w-full"
          />
          <input
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="Min rating"
            className="border border-gray p-2 rounded w-28"
          />
          <button
            onClick={() => fetchRows(1)}
            className="btn-primary text-white px-3 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm text-gray">
            <thead className="bg-color-2">
              <tr>
                <th className="p-2 text-left">Reviewer</th>
                <th className="p-2 text-left">Reviewee</th>
                <th className="p-2 text-center">Rating</th>
                <th className="p-2 text-left">Comment</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-200 text-gray-700">
                        {r.reviewer?.type || "—"}
                      </span>
                      <div className="leading-5">
                        <div className="font-medium">
                          {r.reviewer?.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.reviewer?.email || "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-200 text-gray-700">
                        {r.reviewee?.type || "—"}
                      </span>
                      <div className="leading-5">
                        <div className="font-medium">
                          {r.reviewee?.name || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.reviewee?.email || "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-2 text-center">{r.rating ?? "—"}</td>
                  <td className="p-2 max-w-[420px] truncate" title={r.comment}>
                    {r.comment || "—"}
                  </td>
                  <td className="p-2 text-center">{fmtDate(r.createdAt)}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => del(r._id)}
                      className="border px-2 py-1 rounded text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && !loading && (
                <tr>
                  <td className="p-4 text-center text-sm text-gray-500" colSpan={6}>
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3">
          <button
            disabled={page <= 1 || loading}
            onClick={() => fetchRows(page - 1)}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">Page {page} / {pages}</span>
          <button
            disabled={page >= pages || loading}
            onClick={() => fetchRows(page + 1)}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
