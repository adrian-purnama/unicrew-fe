import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";
import Navigation from "../../component/Navigation";

export default function AdminCompaniesPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchRows = async (p = 1) => {
    const { data } = await axiosInstance.get("/admin/companies", { params: { q, page: p, limit: 20 } });
    setRows(data.items || []);
    setPage(data.page);
    setPages(data.pages);
  };

  useEffect(() => { fetchRows(1); }, []);

  const activate = async (id, on) => {
    const url = on ? `/admin/companies/${id}/activate` : `/admin/companies/${id}/deactivate`;
    await axiosInstance.patch(url);
    toast.success(on ? "Activated" : "Deactivated");
    fetchRows(page);
  };

  const del = async (id) => {
    if (!confirm("Delete this company? This cannot be undone.")) return;
    await axiosInstance.delete(`/admin/companies/${id}`);
    toast.success("Deleted");
    fetchRows(page);
  };

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto p-6 bg-color-1 min-h-[100vh] text-color">
        <h1 className="text-xl font-semibold mb-4">Companies</h1>
        <div className="flex gap-2 mb-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company/email" className="border border-gray text-color p-2 rounded w-full" />
          <button onClick={() => fetchRows(1)} className="btn-primary px-3 py-2 rounded">Search</button>
        </div>

        <div className="overflow-x-auto border border-gray rounded">
          <table className="min-w-full text-sm border-gray border text-gray">
            <thead className="bg-color-2">
              <tr>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2">Verified</th>
                <th className="p-2">Active</th>
                <th className="p-2">Rating</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">{r.companyName}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2 text-center">{r.isVerified ? "✅" : "—"}</td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {typeof r?.rating?.average === "number" ? `${r.rating.average.toFixed(1)} ★ (${r.rating.count || 0})` : "—"}
                  </td>
                  <td className="p-2 flex gap-2 justify-center">
                    {r.isActive ? (
                      <button onClick={() => activate(r._id, false)} className="border px-2 py-1 rounded">Deactivate</button>
                    ) : (
                      <button onClick={() => activate(r._id, true)} className="border px-2 py-1 rounded">Activate</button>
                    )}
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
    </>
  );
}
