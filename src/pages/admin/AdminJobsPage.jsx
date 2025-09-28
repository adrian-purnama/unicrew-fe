import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  RefreshCw,
  Building,
  MapPin,
  DollarSign,
  Users,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axiosInstance from "../../../utils/ApiHelper";


const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    isActive: undefined,
    workType: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching jobs...");
      
      // Build query parameters
      const params = new URLSearchParams();
      if (q.trim()) params.append("q", q.trim());
      if (filters.isActive !== undefined) params.append("isActive", filters.isActive.toString());
      if (filters.workType) params.append("workType", filters.workType);
      
      const queryString = params.toString();
      const url = queryString ? `/admin/jobs?${queryString}` : `/admin/jobs`;
      
      const response = await axiosInstance.get(url);
      console.log("Jobs response:", response.data);
      setJobs(response.data.items || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  }, [q, filters]);

  const fetchApplications = useCallback(async (jobId) => {
    try {
      console.log(`Fetching applications for job: ${jobId}`);
      const response = await axiosInstance.get(`/admin/jobs/${jobId}/applications`);
      console.log("Applications response:", response.data);
      setApplications(response.data || []);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      console.error("Error details:", error.response?.data);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSelectJob = (job) => {
    console.log("Selected job:", job);
    setSelectedJob(job);
    fetchApplications(job._id);
  };

  const handleToggleActive = async (job) => {
    try {
      await axiosInstance.patch(`/admin/jobs/${job._id}/toggle-active`, {
        isActive: !job.isActive,
      });
      fetchJobs();
    } catch (error) {
      console.error("Failed to toggle job status:", error);
    }
  };

  const handleDeleteJob = async (job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"?\n\nThis will also delete all applications for this job.`)) return;
    
    try {
      const response = await axiosInstance.delete(`/admin/jobs/${job._id}`);
      console.log("Delete response:", response.data);
      
      // Show success message
      toast.success(response.data.message || "Job and applications deleted successfully");
      
      fetchJobs();
      if (selectedJob?._id === job._id) {
        setSelectedJob(null);
        setApplications([]);
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job");
    }
  };

  const clearFilters = () => {
    setFilters({
      isActive: undefined,
      workType: "",
    });
    setQ("");
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case "applied":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "shortlisted":
        return <UserCheck className="w-4 h-4 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <UserX className="w-4 h-4 text-red-500" />;
      case "ended":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return "Not specified";
    const { min, max, currency = "IDR" } = salaryRange;
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `${currency} ${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${currency} ${max.toLocaleString()}`;
    }
    return "Not specified";
  };

  const formatLocation = (location) => {
    if (!location) return "Remote";
    const parts = [];
    if (location.kecamatan?.name) parts.push(location.kecamatan.name);
    if (location.kabupaten?.name) parts.push(location.kabupaten.name);
    if (location.provinsi?.name) parts.push(location.provinsi.name);
    return parts.length > 0 ? parts.join(", ") : "Not specified";
  };

  const applicationStats = useMemo(() => {
    const stats = {
      applied: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
      ended: 0,
    };
    applications.forEach(app => {
      if (Object.prototype.hasOwnProperty.call(stats, app.status)) {
        stats[app.status]++;
      }
    });
    return stats;
  }, [applications]);

  return (
    <div className="min-h-screen bg-color-1">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-color">
            Job Management
          </h1>
          <p className="mt-2 text-gray">
            Manage job posts and view applications
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4" />
              <input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Search by title or description..." 
                className="w-full pl-10 pr-4 py-3 border border-gray rounded-lg bg-color-2 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
            </div>
            <button 
              onClick={() => fetchJobs()} 
              className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray rounded-lg hover:bg-color-1 transition"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-color-2 p-6 rounded-lg border border-gray">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-color mb-3">Status</label>
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
                  <label className="block text-sm font-medium text-color mb-3">Work Type</label>
                  <select
                    value={filters.workType}
                    onChange={(e) => setFilters({...filters, workType: e.target.value})}
                    className="w-full p-3 border border-gray rounded-lg bg-color-1 text-color focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="">All Types</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
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
                  {jobs.length} jobs found
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Jobs List */}
          <div>
             <div className="bg-color-2 shadow rounded-lg">
               <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                 <h2 className="text-lg font-semibold text-color">Job Posts</h2>
               </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  <p className="mt-2 text-gray">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-8 text-center">
                  <Briefcase className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray">No jobs found</p>
                </div>
              ) : (
                 <div className="divide-y divide-gray">
                   {jobs.map((job) => (
                     <div
                       key={job._id}
                       className={`p-6 hover:bg-color-1 cursor-pointer transition ${
                         selectedJob?._id === job._id ? "bg-primary/5 border-l-4 border-primary" : ""
                       }`}
                       onClick={() => handleSelectJob(job)}
                     >
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <h3 className="text-lg font-semibold text-color mb-2">
                             {job.title}
                           </h3>
                           <div className="flex items-center gap-4 text-sm text-gray mb-2">
                             <div className="flex items-center gap-1">
                               <Building className="w-4 h-4" />
                               {job.company?.companyName || "Unknown Company"}
                             </div>
                             <div className="flex items-center gap-1">
                               <MapPin className="w-4 h-4" />
                               {formatLocation(job.location)}
                             </div>
                             <div className="flex items-center gap-1">
                               <Briefcase className="w-4 h-4" />
                               {job.workType}
                             </div>
                           </div>
                           <div className="flex items-center gap-1 text-sm text-gray mb-2">
                             <DollarSign className="w-4 h-4" />
                             {formatSalary(job.salaryRange)}
                           </div>
                           <div className="flex items-center gap-2">
                             <span
                               className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                 job.isActive
                                   ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                   : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                               }`}
                             >
                               {job.isActive ? "Active" : "Inactive"}
                             </span>
                             <span className="text-xs text-gray">
                               {new Date(job.createdAt).toLocaleDateString()}
                             </span>
                           </div>
                         </div>
                         <div className="flex items-center gap-2 ml-4">
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleToggleActive(job);
                             }}
                             className={`p-2 rounded-lg transition ${
                               job.isActive
                                 ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                 : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                             }`}
                             title={job.isActive ? "Deactivate" : "Activate"}
                           >
                             {job.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </button>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteJob(job);
                             }}
                             className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                             title="Delete"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              )}

            </div>
          </div>

          {/* Applications */}
          <div>
             <div className="bg-color-2 shadow rounded-lg">
               <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                 <h2 className="text-lg font-semibold text-color">
                   Applications
                   {selectedJob && (
                     <span className="text-sm font-normal text-gray ml-2">
                       for {selectedJob.title}
                     </span>
                   )}
                 </h2>
               </div>

              {!selectedJob ? (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray">Select a job to view applications</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray">No applications found</p>
                </div>
              ) : (
                <>
                   {/* Application Stats */}
                   <div className="px-6 py-4 bg-color-1 border-b border-gray">
                     <div className="grid grid-cols-5 gap-4 text-center">
                       <div>
                         <div className="text-2xl font-bold text-blue-600">
                           {applicationStats.applied}
                         </div>
                         <div className="text-xs text-gray">Applied</div>
                       </div>
                       <div>
                         <div className="text-2xl font-bold text-yellow-600">
                           {applicationStats.shortlisted}
                         </div>
                         <div className="text-xs text-gray">Shortlisted</div>
                       </div>
                       <div>
                         <div className="text-2xl font-bold text-green-600">
                           {applicationStats.accepted}
                         </div>
                         <div className="text-xs text-gray">Accepted</div>
                       </div>
                       <div>
                         <div className="text-2xl font-bold text-red-600">
                           {applicationStats.rejected}
                         </div>
                         <div className="text-xs text-gray">Rejected</div>
                       </div>
                       <div>
                         <div className="text-2xl font-bold text-gray-600">
                           {applicationStats.ended}
                         </div>
                         <div className="text-xs text-gray">Ended</div>
                       </div>
                     </div>
                   </div>

                  {/* Applications List */}
                  <div className="divide-y divide-gray max-h-96 overflow-y-auto">
                    {applications.map((application) => (
                      <div key={application._id} className="p-4 hover:bg-color-1 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-color">
                              {application.user?.fullName || "Unknown User"}
                            </h4>
                            <p className="text-sm text-gray mb-2">
                              {application.user?.email}
                            </p>
                            {application.user?.externalSystemId && (
                              <p className="text-xs text-gray mb-2">
                                External ID: {application.user.externalSystemId}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  application.status
                                )}`}
                              >
                                {getStatusIcon(application.status)}
                                <span className="ml-1 capitalize">
                                  {application.status}
                                </span>
                              </span>
                              <span className="text-xs text-gray">
                                {new Date(application.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobsPage;
