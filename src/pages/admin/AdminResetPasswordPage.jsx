// src/pages/admin/AdminResetPasswordPage.jsx
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper"; 

const TABS = [
  { key: "user", label: "Users" },
  { key: "company", label: "Companies" },
  { key: "admin", label: "Admins" },
];

function fmt(d) { try { return new Date(d).toLocaleString(); } catch { return "—"; } }

export default function AdminResetPasswordPage() {
  const [tab, setTab] = useState("user");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // filter toggles
  const [isActive, setIsActive] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [trusted, setTrusted] = useState(""); // companies only

  // reset modal
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const params = useMemo(() => {
    const p = { q, page, limit: 20 };
    if (isActive !== "")   p.isActive   = isActive;
    if (isVerified !== "") p.isVerified = isVerified;
    if (tab === "company" && trusted !== "") p.trusted = trusted;
    return p;
  }, [q, page, isActive, isVerified, trusted, tab]);

  const fetchRows = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/accounts/${tab}`, {
        params: { ...params, page: p },
      });
      setRows(data.items || []);
      setPage(data.page);
      setPages(data.pages);
    } catch (e) {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(1); /* eslint-disable-next-line */ }, [tab]); // on tab change
  const onSearch = () => fetchRows(1);

  const openReset = (row) => {
    setTarget(row);
    setPw(""); setPw2("");
    setOpen(true);
  };

  const submitReset = async () => {
    if (!target) return;
    if (pw !== pw2) return toast.error("Passwords do not match");
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (!/\d/.test(pw)) return toast.error("Password must include a number");
    if (!/[^A-Za-z0-9]/.test(pw)) return toast.error("Password must include a special character");

    setSubmitting(true);
    try {
      await axiosInstance.post(`/admin/reset-password/${tab}`, {
        id: target._id,
        newPassword: pw,
      });
      toast.success("Password reset");
      setOpen(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-color-1 min-h-screen text-color">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Reset Password (Admin)</h1>

        {/* Tabs */}
        <div className="inline-flex gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`px-3 py-1.5 rounded border ${tab === t.key ? "bg-primary text-white border-primary" : "bg-color-2 border-gray"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name/email…"
            className="border border-gray p-2 rounded w-full"
          />
          <select value={isActive} onChange={(e) => setIsActive(e.target.value)} className="border border-gray p-2 rounded">
            <option value="">Active: All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select value={isVerified} onChange={(e) => setIsVerified(e.target.value)} className="border border-gray p-2 rounded">
            <option value="">Email Verified: All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          {tab === "company" && (
            <select value={trusted} onChange={(e) => setTrusted(e.target.value)} className="border border-gray p-2 rounded">
              <option value="">Trusted: All</option>
              <option value="true">Trusted</option>
              <option value="false">Untrusted</option>
            </select>
          )}
          <button onClick={onSearch} className="btn-primary text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Loading…" : "Search"}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm text-gray">
            <thead className="bg-color-2">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-center">Role</th>
                <th className="p-2 text-center">Active</th>
                <th className="p-2 text-center">Email Verified</th>
                {tab === "company" && <th className="p-2 text-center">Trusted</th>}
                <th className="p-2 text-center">Created</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2">{r.name || "—"}</td>
                  <td className="p-2">{r.email || "—"}</td>
                  <td className="p-2 text-center">{r.role}</td>
                  <td className="p-2 text-center">{r.isActive === null ? "—" : (r.isActive ? "Yes" : "No")}</td>
                  <td className="p-2 text-center">{r.isVerified === null ? "—" : (r.isVerified ? "Yes" : "No")}</td>
                  {tab === "company" && (
                    <td className="p-2 text-center">{r.trusted === null ? "—" : (r.trusted ? "Yes" : "No")}</td>
                  )}
                  <td className="p-2 text-center">{fmt(r.createdAt)}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => openReset(r)} className="border px-2 py-1 rounded">
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr><td className="p-4 text-center text-sm text-gray-500" colSpan={tab === "company" ? 8 : 7}>No accounts found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <button disabled={page <= 1 || loading} onClick={() => fetchRows(page - 1)} className="border px-3 py-1 rounded disabled:opacity-50">
            Prev
          </button>
          <span className="text-sm">Page {page} / {pages}</span>
          <button disabled={page >= pages || loading} onClick={() => fetchRows(page + 1)} className="border px-3 py-1 rounded disabled:opacity-50">
            Next
          </button>
        </div>

        {/* Reset modal (simple inline) */}
        {open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 text-color w-full max-w-md rounded-lg p-5 shadow-xl">
              <h2 className="text-lg font-semibold mb-3">Reset password</h2>
              <p className="text-sm text-gray mb-4">
                Target: <b>{target?.name}</b> <span className="text-gray-400">({target?.email})</span>
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      className="w-full border border-gray bg-color-1 text-color px-3 py-2 rounded pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs underline"
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="text-xs text-gray mt-1">Min 8 chars, include a number & a special character.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    className="w-full border border-gray bg-color-1 text-color px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setOpen(false)} className="border px-3 py-1 rounded">Cancel</button>
                <button onClick={submitReset} disabled={submitting} className="btn-primary px-4 py-1.5 rounded font-bold">
                  {submitting ? "Saving…" : "Reset"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
