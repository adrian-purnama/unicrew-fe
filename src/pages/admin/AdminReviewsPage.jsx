// src/pages/admin/AdminReviewsPage.jsx
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";
import { 
  Search, 
  Filter, 
  RefreshCw,
  Star,
  Calendar,
  Trash2,
  User,
  Building,
  MessageSquare
} from "lucide-react";


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
  const [filters, setFilters] = useState({
    minRating: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);

  const fetchRows = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { 
        q, 
        page: p, 
        limit: 20,
        ...(filters.minRating !== undefined && { minRating: filters.minRating })
      };
      const { data } = await axiosInstance.get("/admin/reviews", { params });
      setRows(data.items || []);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [q, filters]);

  useEffect(() => { fetchRows(1); }, [fetchRows]);

  const del = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await axiosInstance.delete(`/admin/reviews/${id}`);
      toast.success("Review deleted");
      fetchRows(page);
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const clearFilters = () => {
    setFilters({
      minRating: undefined
    });
  };

  const handleSelectReview = (reviewId) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === rows.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(rows.map(review => review._id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedReviews.length === 0) return;
    
    try {
      const promises = selectedReviews.map(id => {
        switch (action) {
          case 'delete':
            return axiosInstance.delete(`/admin/reviews/${id}`);
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      toast.success(`Bulk ${action} completed for ${selectedReviews.length} reviews`);
      setSelectedReviews([]);
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
              <h1 className="text-3xl font-bold text-color">Review Management</h1>
              <p className="text-gray mt-2">Monitor and manage user reviews and ratings</p>
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
                  placeholder="Search by comment, reviewer, or reviewee..." 
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-color mb-3">Minimum Rating</label>
                    <select
                      value={filters.minRating === undefined ? "" : filters.minRating.toString()}
                      onChange={(e) => setFilters({...filters, minRating: e.target.value === "" ? undefined : parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray rounded-lg bg-color-1 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                    >
                      <option value="">All Ratings</option>
                      <option value="1">1+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="5">5 Stars Only</option>
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
                    {rows.length} reviews found
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedReviews.length > 0 && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-color font-medium">
                    {selectedReviews.length} review{selectedReviews.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReviews([])}
                  className="text-gray hover:text-color transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Reviews Table */}
          <div className="bg-color-2 rounded-lg border border-gray overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-color-2 border-b border-gray">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedReviews.length === rows.length && rows.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Reviewer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Reviewee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-color uppercase tracking-wider">
                      Date
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
                          Loading reviews...
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray">
                        No reviews found
                      </td>
                    </tr>
                  ) : (
                    rows.map((review) => (
                      <tr key={review._id} className="hover:bg-color-1/50 transition">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review._id)}
                            onChange={() => handleSelectReview(review._id)}
                            className="rounded border-gray text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              {review.reviewer?.type === 'User' ? (
                                <User className="w-5 h-5 text-primary" />
                              ) : (
                                <Building className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-color">{review.reviewer?.name || "—"}</div>
                              <div className="text-sm text-gray flex items-center gap-1">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {review.reviewer?.type || "—"}
                                </span>
                              </div>
                              <div className="text-xs text-gray">{review.reviewer?.email || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              {review.reviewee?.type === 'User' ? (
                                <User className="w-5 h-5 text-primary" />
                              ) : (
                                <Building className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-color">{review.reviewee?.name || "—"}</div>
                              <div className="text-sm text-gray flex items-center gap-1">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {review.reviewee?.type || "—"}
                                </span>
                              </div>
                              <div className="text-xs text-gray">{review.reviewee?.email || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium text-color">
                              {review.rating || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-color truncate" title={review.comment}>
                              {review.comment || "—"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray">
                            <Calendar className="w-4 h-4" />
                            {fmtDate(review.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => del(review._id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
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
              Showing {rows.length} reviews on page {page} of {pages}
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
