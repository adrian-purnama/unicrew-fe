import { useEffect, useState } from "react";
import Navigation from "../../component/Navigation";
import BaseModal from "../../component/BaseModal";
import JobPostForm from "../../component/JobPostForm";
import JobCard from "../../component/JobCard";
import axiosInstance from "../../../utils/ApiHelper";
import toast from "react-hot-toast";

export default function CompanyHomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReviews: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/job/job-postings");
      setJobPosts(res.data);
      
      // Calculate stats
      const activeJobs = res.data.filter(job => job.status === 'active').length;
      const totalApplications = res.data.reduce((sum, job) => sum + (job.applicantCount || 0), 0);
      
      setStats({
        totalJobs: res.data.length,
        // activeJobs,
        // totalApplications,
        pendingReviews: 0 // You might want to fetch this separately
      });
    } catch (err) {
      console.error("Failed to load job postings:", err.message);
      toast.error("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const reviewRes = await axiosInstance.get("/review/pending-reviews");
      setStats(prev => ({
        ...prev,
        pendingReviews: reviewRes.data.length
      }));
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, []);

  const handlePostSuccess = () => {
    setIsModalOpen(false);
    fetchJobs();
    toast.success("Job posted successfully!");
  };

  const handleDelete = (id) => {
    setJobPosts((prev) => prev.filter((job) => job._id !== id));
    setStats(prev => ({
      ...prev,
      totalJobs: prev.totalJobs - 1,
      activeJobs: prev.activeJobs - 1
    }));
    toast.success("Job deleted successfully");
  };

  const handleStatusChange = () => {
    fetchJobs();
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = jobPosts
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || job.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        case "applications":
          return (b.applicantCount || 0) - (a.applicantCount || 0);
        default:
          return 0;
      }
    });

  const StatCard = ({ icon, title, value, subtitle, color = "primary" }) => {
    const colorClasses = {
      primary: "bg-primary-20 border-primary text-primary",
      green: "bg-green-50 border-green-200 text-green-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600"
    };

    return (
      <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg hover:scale-105 duration-300 cursor-pointer group`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-1 group-hover:scale-110 transition-transform duration-300">{value}</p>
            {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
          </div>
          <div className="text-3xl opacity-60 group-hover:rotate-12 transition-transform duration-300">{icon}</div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-color-1">
      <Navigation />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section with Gradient Background */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-8">
            <div>
              <h1 className="text-3xl font-bold text-color bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent">
                Job Management Dashboard
              </h1>
              <p className="text-gray mt-1">
                Manage your job postings and track applications
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary text-white font-semibold flex items-center gap-2 self-start md:self-auto shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="text-xl">+</span>
              Post New Job
            </button>
          </div>
        </div>

        {/* Stats Cards with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="💼"
            title="Total Jobs"
            value={stats.totalJobs}
            subtitle="All time"
            color="primary"
          />
          {/* <StatCard
            icon="✅"
            title="Active Jobs"
            value={stats.activeJobs}
            subtitle="Currently hiring"
            color="green"
          />
          <StatCard
            icon="📋"
            title="Applications"
            value={stats.totalApplications}
            subtitle="Total received"
            color="purple"
          /> */}
          <StatCard
            icon="⭐"
            title="Pending Reviews"
            value={stats.pendingReviews}
            subtitle="Awaiting feedback"
            color="orange"
          />
        </div>

        {/* Filters and Search with Theme Colors */}
        <div className="bg-color-2 rounded-xl p-6 mb-6 shadow-sm border border-gray">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search jobs by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray rounded-lg bg-color-1 text-color focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray">
                  Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray rounded-lg px-3 py-2 text-sm bg-color-1 text-color focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray rounded-lg px-3 py-2 text-sm bg-color-1 text-color focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="applications">Most Applications</option>
                </select>
              </div>

              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="text-sm text-primary hover:text-highlight font-medium px-3 py-2 hover:bg-primary-20 rounded-lg transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray">
            <p className="text-sm text-gray">
              Showing <span className="font-semibold text-primary">{filteredAndSortedJobs.length}</span> of <span className="font-semibold">{jobPosts.length}</span> jobs
              {searchTerm && (
                <span> matching "<span className="text-primary font-medium">{searchTerm}</span>"</span>
              )}
              {filterStatus !== "all" && (
                <span> with status "<span className="text-primary font-medium">{filterStatus}</span>"</span>
              )}
            </p>
          </div>
        </div>

        {/* Job Listings with Enhanced Card Design */}
        <div className="bg-color-2 rounded-xl shadow-sm border border-gray overflow-hidden">
          <div className="p-6 border-b border-gray bg-gradient-to-r from-primary/5 to-transparent">
            <h2 className="text-xl font-semibold text-color">
              Your Job Postings
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredAndSortedJobs.length === 0 ? (
              <div className="text-center py-12">
                {jobPosts.length === 0 ? (
                  // No jobs at all
                  <div>
                    <div className="text-6xl mb-4 animate-bounce">💼</div>
                    <h3 className="text-xl font-semibold text-color mb-2">
                      No job postings yet
                    </h3>
                    <p className="text-gray mb-6">
                      Start by creating your first job posting to attract talented candidates
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="btn-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Create Your First Job
                    </button>
                  </div>
                ) : (
                  // No jobs match filters
                  <div>
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-color mb-2">
                      No jobs match your filters
                    </h3>
                    <p className="text-gray mb-4">
                      Try adjusting your search terms or filters
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                      }}
                      className="text-primary hover:text-highlight font-medium hover:bg-primary-20 px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAndSortedJobs.map((job, index) => (
                  <div
                    key={job._id}
                    className="transition-all duration-300 rounded-xl transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <JobCard
                      job={job}
                      mode="company"
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Post Modal */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post a New Job"
      >
        <JobPostForm onSuccess={handlePostSuccess} />
      </BaseModal>
    </div>
  );
}