// src/pages/admin/AdminResetPasswordPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";
import { 
  Search, 
  Filter, 
  RefreshCw,
  User,
  Building,
  Shield,
  Key,
  Eye,
  EyeOff,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react"; 

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

  const fetchRows = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/admin/accounts/${tab}`, {
        params: { ...params, page: p },
      });
      setRows(data.items || []);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [tab, params]);

  useEffect(() => { fetchRows(1); }, [fetchRows]);
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
    <>
      <div className="bg-color-1 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-color">Password Reset Management</h1>
              <p className="text-gray mt-2">Reset passwords for users, companies, and admins</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchRows(page)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-color-2 border border-gray rounded-lg text-color hover:bg-color-2/80 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition ${
                  tab === t.key 
                    ? "bg-primary text-white border-primary" 
                    : "bg-color-2 border-gray text-color hover:bg-color-2/80"
                }`}
              >
                {t.key === "user" && <User className="w-4 h-4" />}
                {t.key === "company" && <Building className="w-4 h-4" />}
                {t.key === "admin" && <Shield className="w-4 h-4" />}
                {t.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
                <input 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                  placeholder="Search by name or email..." 
                  className="w-full pl-10 pr-4 py-3 border border-gray rounded-lg bg-color-2 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <button 
                onClick={onSearch} 
                className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
                disabled={loading}
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="bg-color-2 p-6 rounded-lg border border-gray">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-color mb-3">Account Status</label>
                  <select 
                    value={isActive} 
                    onChange={(e) => setIsActive(e.target.value)} 
                    className="w-full p-3 border border-gray rounded-lg bg-color-1 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-color mb-3">Email Verification</label>
                  <select 
                    value={isVerified} 
                    onChange={(e) => setIsVerified(e.target.value)} 
                    className="w-full p-3 border border-gray rounded-lg bg-color-1 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="">All Verification</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                </div>
                {tab === "company" && (
                  <div>
                    <label className="block text-sm font-medium text-color mb-3">Trust Status</label>
                    <select 
                      value={trusted} 
                      onChange={(e) => setTrusted(e.target.value)} 
                      className="w-full p-3 border border-gray rounded-lg bg-color-1 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                      <option value="">All Trust Status</option>
                      <option value="true">Trusted</option>
                      <option value="false">Not Trusted</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray">
                  {rows.length} accounts found
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-color-2 rounded-lg border border-gray overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-color-2 border-b border-gray">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Verification
                    </th>
                    {tab === "company" && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                        Trust
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray">
                  {loading ? (
                    <tr>
                      <td colSpan={tab === "company" ? 7 : 6} className="px-6 py-12 text-center text-gray">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading accounts...
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={tab === "company" ? 7 : 6} className="px-6 py-12 text-center text-gray">
                        No accounts found
                      </td>
                    </tr>
                  ) : (
                    rows.map((account) => (
                      <tr key={account._id} className="hover:bg-color-1/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              {tab === "user" && <User className="w-5 h-5 text-primary" />}
                              {tab === "company" && <Building className="w-5 h-5 text-primary" />}
                              {tab === "admin" && <Shield className="w-5 h-5 text-primary" />}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-color">{account.name || "—"}</div>
                              <div className="text-sm text-gray">{account.email || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {account.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            account.isActive === null 
                              ? 'bg-gray-100 text-gray-800' 
                              : account.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {account.isActive === null ? "—" : (account.isActive ? "Active" : "Inactive")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            account.isVerified === null 
                              ? 'bg-gray-100 text-gray-800' 
                              : account.isVerified 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {account.isVerified === null ? "—" : (account.isVerified ? "Verified" : "Unverified")}
                          </span>
                        </td>
                        {tab === "company" && (
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              account.trusted === null 
                                ? 'bg-gray-100 text-gray-800' 
                                : account.trusted 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {account.trusted === null ? "—" : (account.trusted ? "Trusted" : "Not Trusted")}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray">
                            <Calendar className="w-4 h-4" />
                            {fmt(account.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openReset(account)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray">
              Showing {rows.length} accounts on page {page} of {pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => fetchRows(page - 1)}
                className="px-4 py-2 border border-gray rounded-lg text-color hover:bg-color-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-color">
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages || loading}
                onClick={() => fetchRows(page + 1)}
                className="px-4 py-2 border border-gray rounded-lg text-color hover:bg-color-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>

          {/* Reset Password Modal */}
          {open && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-color-2 text-color w-full max-w-md rounded-lg p-6 shadow-xl border border-gray">
                <div className="flex items-center gap-3 mb-4">
                  <Key className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Reset Password</h2>
                </div>
                
                <div className="mb-4 p-3 bg-color-1 rounded-lg border border-gray">
                  <div className="text-sm text-gray mb-1">Target Account:</div>
                  <div className="font-medium text-color">{target?.name}</div>
                  <div className="text-sm text-gray">{target?.email}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-color mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        className="w-full border border-gray bg-color-1 text-color px-3 py-2 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-color transition"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray mt-1">
                      Minimum 8 characters, include a number and special character
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-color mb-2">Confirm Password</label>
                    <input
                      type={showPw ? "text" : "password"}
                      value={pw2}
                      onChange={(e) => setPw2(e.target.value)}
                      className="w-full border border-gray bg-color-1 text-color px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    onClick={() => setOpen(false)} 
                    className="px-4 py-2 border border-gray rounded-lg text-color hover:bg-color-1 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitReset} 
                    disabled={submitting} 
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Reset Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
