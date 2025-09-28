import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";
import Navigation from "../../component/Navigation";
import { 
  ShieldCheck, 
  ShieldX, 
  UserCheck, 
  UserX, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  MoreHorizontal,
  Star,
  Calendar,
  Mail,
  User,
  Settings,
  RefreshCw
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

export default function AdminUsersPage() {
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
  const [selectedUsers, setSelectedUsers] = useState([]);

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
      const { data } = await axiosInstance.get("/admin/users", { params });
    setRows(data.items || []);
    setPage(data.page);
    setPages(data.pages);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [q, filters]);

  useEffect(() => { fetchRows(1); }, [fetchRows]);

  const activate = async (id, on) => {
    try {
    const url = on ? `/admin/users/${id}/activate` : `/admin/users/${id}/deactivate`;
    await axiosInstance.patch(url);
      toast.success(on ? "User activated" : "User deactivated");
    fetchRows(page);
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
    await axiosInstance.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchRows(page);
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const verify = async (id) => {
    const notes = prompt("Add verification notes (optional):");
    try {
      await axiosInstance.patch(`/admin/users/${id}/verify`, { notes: notes || "" });
      toast.success("User verified");
      fetchRows(page);
    } catch {
      toast.error("Failed to verify user");
    }
  };

  const unverify = async (id) => {
    if (!confirm("Remove verification from this user?")) return;
    try {
      await axiosInstance.patch(`/admin/users/${id}/unverify`);
      toast.success("User unverified");
      fetchRows(page);
    } catch {
      toast.error("Failed to unverify user");
    }
  };

  const clearFilters = () => {
    setFilters({
      isActive: undefined,
      isVerified: undefined,
      trusted: undefined
    });
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === rows.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(rows.map(user => user._id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;
    
    try {
      const promises = selectedUsers.map(id => {
        switch (action) {
          case 'activate':
            return axiosInstance.patch(`/admin/users/${id}/activate`);
          case 'deactivate':
            return axiosInstance.patch(`/admin/users/${id}/deactivate`);
          case 'verify':
            return axiosInstance.patch(`/admin/users/${id}/verify`, { notes: "Bulk verification" });
          case 'unverify':
            return axiosInstance.patch(`/admin/users/${id}/unverify`);
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      toast.success(`Bulk ${action} completed for ${selectedUsers.length} users`);
      setSelectedUsers([]);
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
              <h1 className="text-3xl font-bold text-color">User Management</h1>
              <p className="text-gray mt-2">Manage user accounts, verification, and permissions</p>
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
                  placeholder="Search by name or email..." 
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
                    {rows.length} users found
                  </div>
                </div>
              </div>
            )}
        </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-color font-medium">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
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
                  onClick={() => setSelectedUsers([])}
                  className="text-gray hover:text-color transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-color-2 rounded-lg border border-gray overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-color-2 border-b border-gray">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === rows.length && rows.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      External ID
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
                      <td colSpan="8" className="px-6 py-12 text-center text-gray">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading users...
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    rows.map((user) => (
                      <tr key={user._id} className="hover:bg-color-1/50 transition">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                            className="rounded border-gray text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-color">{user.fullName}</div>
                              <div className="text-sm text-gray flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                              <div className="text-xs text-gray">ID: {shortId(user._id)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-color">
                            {user.externalSystemId || (
                              <span className="text-gray italic">Not set</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.isVerified 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isVerified ? 'Email Verified' : 'Unverified'}
                    </span>
                  </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {user.trust?.verified ? (
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
                            {user.trust?.verified && user.trust?.at && (
                              <div className="text-xs text-gray flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {fmt(user.trust.at)}
                              </div>
                            )}
                            {user.trust?.verified && user.trust?.by && (
                              <div className="text-xs text-gray">
                                By: {user.trust.by.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium text-color">
                              {user.rating?.average?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-xs text-gray">({user.rating?.count || 0})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {/* Trust Actions */}
                            {user.trust?.verified ? (
                              <button
                                onClick={() => unverify(user._id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                                title="Remove Trust"
                              >
                                <ShieldX className="w-3 h-3 mr-1" />
                                Unverify
                              </button>
                            ) : (
                              <button
                                onClick={() => verify(user._id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition"
                                title="Trust User"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Verify
                              </button>
                            )}

                            {/* Account Actions */}
                            {user.isActive ? (
                              <button
                                onClick={() => activate(user._id, false)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition"
                                title="Deactivate Account"
                              >
                                <UserX className="w-3 h-3 mr-1" />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => activate(user._id, true)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                                title="Activate Account"
                              >
                                <UserCheck className="w-3 h-3 mr-1" />
                                Activate
                              </button>
                            )}

                            {/* Delete Action */}
                            <button
                              onClick={() => del(user._id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                              title="Delete User"
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
              Showing {rows.length} users on page {page} of {pages}
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
