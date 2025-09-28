// src/pages/admin/AdminCompaniesPage.jsx
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";
import { 
  ShieldCheck, 
  ShieldX, 
  UserCheck, 
  UserX, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw,
  Building,
  Mail,
  Star,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    isActive: undefined,
    isVerified: undefined,
    trusted: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const fetchRows = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { 
        q, 
        page: p, 
        limit: 20,
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
        ...(filters.trusted !== undefined && { trusted: filters.trusted })
      };
      const { data } = await axiosInstance.get("/admin/companies", { params });
      setRows(data.items || []);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }, [q, filters]);

  useEffect(() => { fetchRows(1); }, [fetchRows]);

  const activate = async (id, on) => {
    try {
      const url = on ? `/admin/companies/${id}/activate` : `/admin/companies/${id}/deactivate`;
      await axiosInstance.patch(url);
      toast.success(on ? "Company activated" : "Company deactivated");
      fetchRows(page);
    } catch {
      toast.error("Failed to update company status");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this company? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/admin/companies/${id}`);
      toast.success("Company deleted");
      fetchRows(page);
    } catch {
      toast.error("Failed to delete company");
    }
  };

  const verify = async (id) => {
    const notes = prompt("Add verification notes (optional):");
    try {
      await axiosInstance.patch(`/admin/companies/${id}/verify`, { notes: notes || "" });
      toast.success("Company verified");
      fetchRows(page);
    } catch {
      toast.error("Failed to verify company");
    }
  };

  const unverify = async (id) => {
    if (!confirm("Remove verification from this company?")) return;
    try {
      await axiosInstance.patch(`/admin/companies/${id}/unverify`);
      toast.success("Company unverified");
      fetchRows(page);
    } catch {
      toast.error("Failed to unverify company");
    }
  };

  const clearFilters = () => {
    setFilters({
      isActive: undefined,
      isVerified: undefined,
      trusted: undefined
    });
  };

  const handleSelectCompany = (companyId) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === rows.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(rows.map(company => company._id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCompanies.length === 0) return;
    
    try {
      const promises = selectedCompanies.map(id => {
        switch (action) {
          case 'activate':
            return axiosInstance.patch(`/admin/companies/${id}/activate`);
          case 'deactivate':
            return axiosInstance.patch(`/admin/companies/${id}/deactivate`);
          case 'verify':
            return axiosInstance.patch(`/admin/companies/${id}/verify`, { notes: "Bulk verification" });
          case 'unverify':
            return axiosInstance.patch(`/admin/companies/${id}/unverify`);
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      toast.success(`Bulk ${action} completed for ${selectedCompanies.length} companies`);
      setSelectedCompanies([]);
      fetchRows(page);
    } catch {
      toast.error("Failed to perform bulk action");
    }
  };

  return (
    <>
      <div className="bg-color-1 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-color">Company Management</h1>
              <p className="text-gray mt-2">Manage company accounts, verification, and permissions</p>
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
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-color-2 border border-gray rounded-lg text-color hover:bg-color-2/80 transition"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
                <input 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                  placeholder="Search by company name or email..." 
                  className="w-full pl-10 pr-4 py-3 border border-gray rounded-lg bg-color-2 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>
              <button 
                onClick={() => fetchRows(1)} 
                className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
              >
                Search
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-color-2 p-6 rounded-lg border border-gray">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-color mb-3">Account Status</label>
                    <select
                      value={filters.isActive === undefined ? "" : filters.isActive.toString()}
                      onChange={(e) => setFilters({...filters, isActive: e.target.value === "" ? undefined : e.target.value === "true"})}
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
                      value={filters.isVerified === undefined ? "" : filters.isVerified.toString()}
                      onChange={(e) => setFilters({...filters, isVerified: e.target.value === "" ? undefined : e.target.value === "true"})}
                      className="w-full p-3 border border-gray rounded-lg bg-color-1 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                      <option value="">All Verification</option>
                      <option value="true">Email Verified</option>
                      <option value="false">Email Unverified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color mb-3">Admin Verification</label>
                    <select
                      value={filters.trusted === undefined ? "" : filters.trusted.toString()}
                      onChange={(e) => setFilters({...filters, trusted: e.target.value === "" ? undefined : e.target.value === "true"})}
                      className="w-full p-3 border border-gray rounded-lg bg-color-1 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                      <option value="">All Trust Status</option>
                      <option value="true">Admin Verified</option>
                      <option value="false">Not Admin Verified</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray hover:text-color transition"
                  >
                    Clear All Filters
                  </button>
                  <div className="text-sm text-gray">
                    {rows.length} companies found
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedCompanies.length > 0 && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-color font-medium">
                    {selectedCompanies.length} compan{selectedCompanies.length > 1 ? 'ies' : 'y'} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleBulkAction('verify')}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleBulkAction('unverify')}
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                    >
                      Unverify
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompanies([])}
                  className="text-gray hover:text-color transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Companies Table */}
          <div className="bg-color-2 rounded-lg border border-gray overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-color-2 border-b border-gray">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.length === rows.length && rows.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Trust
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading companies...
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray">
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    rows.map((company) => (
                      <tr key={company._id} className="hover:bg-color-1/50 transition">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCompanies.includes(company._id)}
                            onChange={() => handleSelectCompany(company._id)}
                            className="rounded border-gray text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <Building className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-color">{company.companyName}</div>
                              <div className="text-sm text-gray flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {company.email}
                              </div>
                              <div className="text-xs text-gray">ID: {shortId(company._id)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            company.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {company.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            company.isVerified 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {company.isVerified ? 'Email Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {company.trust?.verified ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Trusted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <ShieldX className="w-3 h-3 mr-1" />
                                Not Trusted
                              </span>
                            )}
                            {company.trust?.verified && company.trust?.at && (
                              <div className="text-xs text-gray flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {fmt(company.trust.at)}
                              </div>
                            )}
                            {company.trust?.verified && company.trust?.by && (
                              <div className="text-xs text-gray">
                                By: {company.trust.by.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium text-color">
                              {company.rating?.average?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-xs text-gray">({company.rating?.count || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {/* Trust Actions */}
                            {company.trust?.verified ? (
                              <button
                                onClick={() => unverify(company._id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                                title="Remove Trust"
                              >
                                <ShieldX className="w-3 h-3 mr-1" />
                                Unverify
                              </button>
                            ) : (
                              <button
                                onClick={() => verify(company._id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition"
                                title="Trust Company"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verify
                              </button>
                            )}

                            {/* Account Actions */}
                            {company.isActive ? (
                              <button
                                onClick={() => activate(company._id, false)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition"
                                title="Deactivate Account"
                              >
                                <UserX className="w-3 h-3 mr-1" />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => activate(company._id, true)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                                title="Activate Account"
                              >
                                <UserCheck className="w-3 h-3 mr-1" />
                                Activate
                              </button>
                            )}

                            {/* Delete Action */}
                            <button
                              onClick={() => del(company._id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                              title="Delete Company"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
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
              Showing {rows.length} companies on page {page} of {pages}
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
        </div>
      </div>
    </>
  );
}
