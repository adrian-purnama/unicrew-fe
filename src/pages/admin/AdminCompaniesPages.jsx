// src/pages/admin/AdminCompaniesPage.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";

function fmt(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleString(); } catch { return "—"; }
}
function shortId(id) {
  if (!id) return "—";
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
}

export default function AdminCompaniesPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchRows = async (p = 1) => {
    const { data } = await axiosInstance.get("/admin/companies", {
      params: { q, page: p, limit: 20 },
    });
    setRows(data.items || []);
    setPage(data.page);
    setPages(data.pages);
    console.log(data)
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

  const verify = async (id) => {
    await axiosInstance.patch(`/admin/companies/${id}/verify`, { notes: "" });
    toast.success("Verified");
    fetchRows(page);
  };

  const unverify = async (id) => {
    await axiosInstance.patch(`/admin/companies/${id}/unverify`);
    toast.success("Unverified");
    fetchRows(page);
  };

  return (
    <div className="bg-color-1 min-h-screen text-color">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Companies</h1>

        <div className="flex gap-2 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search company/email"
            className="border border-gray text-color p-2 rounded w-full"
          />
          <button onClick={() => fetchRows(1)} className="btn-primary px-3 py-2 rounded">
            Search
          </button>
        </div>

        <div className="overflow-x-auto border border-gray rounded">
          <table className="min-w-full text-sm border-gray border text-gray">
            <thead className="bg-color-2">
              <tr>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-center">Email Verified</th>
                <th className="p-2 text-center">Trusted</th>
                <th className="p-2 text-left">Trusted Meta</th>
                <th className="p-2 text-center">Active</th>
                <th className="p-2 text-center">Rating</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">{r.companyName}</td>
                  <td className="p-2">{r.email}</td>

                  <td className="p-2 text-center">{r.isVerified ? "✅" : "—"}</td>

                  <td className="p-2 text-center">
                    {r?.trust?.verified ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Verified</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">Unverified</span>
                    )}
                  </td>

                  <td className="p-2">
                    <div className="text-xs leading-5">
                      <div><span className="text-gray">By:</span> {r?.trust?.by?.email}</div>
                      <div><span className="text-gray">At:</span> {fmt(r?.trust?.at)}</div>
                    </div>
                  </td>

                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        r.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-2 text-center">
                    {typeof r?.rating?.average === "number"
                      ? `${r.rating.average.toFixed(1)} ★ (${r.rating.count || 0})`
                      : "—"}
                  </td>

                  <td className="p-2">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {r?.trust?.verified ? (
                        <button onClick={() => unverify(r._id)} className="border px-2 py-1 rounded">
                          Unverify
                        </button>
                      ) : (
                        <button onClick={() => verify(r._id)} className="border px-2 py-1 rounded">
                          Verify
                        </button>
                      )}
                      {r.isActive ? (
                        <button onClick={() => activate(r._id, false)} className="border px-2 py-1 rounded">
                          Deactivate
                        </button>
                      ) : (
                        <button onClick={() => activate(r._id, true)} className="border px-2 py-1 rounded">
                          Activate
                        </button>
                      )}
                      <button onClick={() => del(r._id)} className="border px-2 py-1 rounded text-red-600">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-sm text-gray-500" colSpan={8}>
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3">
          <button disabled={page <= 1} onClick={() => fetchRows(page - 1)} className="border px-3 py-1 rounded disabled:opacity-50">
            Prev
          </button>
          <span className="text-sm">Page {page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => fetchRows(page + 1)} className="border px-3 py-1 rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
