import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";
import Navigation from "../../component/Navigation";

export default function AdminReviewsPage() {
  const [q, setQ] = useState("");
  const [minRating, setMinRating] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchRows = async (p = 1) => {
    const params = { q, page: p, limit: 20 };
    if (minRating) params.minRating = minRating;
    const { data } = await axiosInstance.get("/admin/reviews", { params });
    setRows(data.items || []);
    setPage(data.page);
    setPages(data.pages);
  };

  useEffect(() => { fetchRows(1); }, []);

  const del = async (id) => {
    if (!confirm("Delete this review?")) return;
    await axiosInstance.delete(`/admin/reviews/${id}`);
    toast.success("Deleted");
    fetchRows(page);
  };

  return (
    <>
      <Navigation />
            <div className="bg-color-1">

      <div className="max-w-6xl mx-auto p-6 bg-color-1 min-h-[100vh] text-color">
        <h1 className="text-xl font-semibold mb-4">Reviews</h1>
        <div className="flex gap-2 mb-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search comment/company/user" className="border p-2 rounded w-full border-gray" />
          <input value={minRating} onChange={(e) => setMinRating(e.target.value)} placeholder="Min rating" className="border p-2 rounded w-28 border-gray" />
          <button onClick={() => fetchRows(1)} className="btn-primary text-white px-3 py-2 rounded">Search</button>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm text-gray">
            <thead className="bg-color-2">
              <tr>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2">Rating</th>
                <th className="p-2 text-left">Comment</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">{r.company?.companyName || "—"}</td>
                  <td className="p-2">{r.user?.fullName || "—"}</td>
                  <td className="p-2 text-center">{r.rating ?? "—"}</td>
                  <td className="p-2 max-w-[420px] truncate" title={r.comment}>{r.comment || "—"}</td>
                  <td className="p-2 text-center">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => del(r._id)} className="border px-2 py-1 rounded text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3">
          <button disabled={page <= 1} onClick={() => fetchRows(page - 1)} className="border px-3 py-1 rounded disabled:opacity-50">Prev</button>
          <span className="text-sm">Page {page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => fetchRows(page + 1)} className="border px-3 py-1 rounded disabled:opacity-50">Next</button>
        </div>
      </div>
            </div>

    </>
  );
}
