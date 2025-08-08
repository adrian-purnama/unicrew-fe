import { useEffect, useState } from "react";
import { BookmarkCheck, Trash2, ExternalLink, Clock, MapPin, DollarSign } from "lucide-react";
import axiosInstance from "../../../utils/ApiHelper";
import toast from "react-hot-toast";

export default function SavedJobs({ onSelectJob }) {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [removing, setRemoving] = useState(null);

    const fetchSavedJobs = async (pageNum = 1) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(
                `/company/saved-jobs?page=${pageNum}&limit=10`
            );

            // Set jobs data
            setSavedJobs(response.data.savedJobs);
            setTotalPages(response.data.totalPages);
            setPage(response.data.page);

            // Set stats from the integrated response
            if (response.data.stats) {
                setStats(response.data.stats);
            } else {
                // Fallback: create stats from legacy fields if new stats not available
                setStats({
                    savedCount: response.data.savedCount || 0,
                    maxAllowed: response.data.maxAllowed || 5,
                    percentageUsed: Math.round(
                        ((response.data.savedCount || 0) / (response.data.maxAllowed || 5)) * 100
                    ),
                    remainingSlots:
                        (response.data.maxAllowed || 5) - (response.data.savedCount || 0),
                    isNearLimit:
                        (response.data.savedCount || 0) >= (response.data.maxAllowed || 5) * 0.8,
                    isAtLimit: (response.data.savedCount || 0) >= (response.data.maxAllowed || 5),
                    subscription: response.data.subscription || "free",
                    upgradeMessage:
                        response.data.subscription !== "premium" &&
                        (response.data.savedCount || 0) >= 3
                            ? `You're using ${response.data.savedCount || 0} of ${
                                  response.data.maxAllowed || 5
                              } saved job slots. Upgrade to Premium for 50 slots!`
                            : null,
                });
            }
        } catch (error) {
            console.error("Error fetching saved jobs:", error);
            toast.error("Failed to fetch saved jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const handleRemoveSaved = async (jobId) => {
        try {
            setRemoving(jobId);
            await axiosInstance.delete(`/company/save-job/${jobId}`);
            toast.success("Job removed from saved list");

            // Remove from local state
            setSavedJobs((prev) => prev.filter((job) => job._id !== jobId));

            // Update stats locally instead of refetching
            setStats((prevStats) => {
                if (!prevStats) return null;

                const newSavedCount = prevStats.savedCount - 1;
                const newPercentageUsed = Math.round((newSavedCount / prevStats.maxAllowed) * 100);

                return {
                    ...prevStats,
                    savedCount: newSavedCount,
                    percentageUsed: newPercentageUsed,
                    remainingSlots: prevStats.maxAllowed - newSavedCount,
                    isNearLimit: newSavedCount >= prevStats.maxAllowed * 0.8,
                    isAtLimit: newSavedCount >= prevStats.maxAllowed,
                    upgradeMessage:
                        prevStats.subscription !== "premium" && newSavedCount >= 3
                            ? `You're using ${newSavedCount} of ${prevStats.maxAllowed} saved job slots. Upgrade to Premium for 50 slots!`
                            : newSavedCount >= prevStats.maxAllowed * 0.8
                            ? `You're running low on saved job slots (${newSavedCount}/${prevStats.maxAllowed}).`
                            : null,
                };
            });
        } catch (error) {
            console.error("Error removing saved job:", error);
            toast.error("Failed to remove saved job");
        } finally {
            setRemoving(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getApplicationStatusBadge = (status) => {
        const statusStyles = {
            applied: "bg-blue-100 text-blue-800",
            shortListed: "bg-yellow-100 text-yellow-800",
            accepted: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
            ended: "bg-gray-100 text-gray-800",
            withdrawn: "bg-orange-100 text-orange-800",
        };

        if (!status) return null;

        return (
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusStyles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, " $1")}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl border p-6">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl">
            {/* Compact Header with Stats */}
            <div className="p-4">
                <h2 className="text-xl font-bold text-color">Saved Jobs</h2>
                {stats && (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm text-gray-600">
                                {stats.savedCount}/{stats.maxAllowed}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        stats.isAtLimit
                                            ? "bg-red-500"
                                            : stats.isNearLimit
                                            ? "bg-yellow-500"
                                            : "bg-primary"
                                    }`}
                                    style={{ width: `${Math.min(stats.percentageUsed, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compact upgrade message */}
                {stats?.upgradeMessage && (
                    <div
                        className={`mt-3 px-3 py-2 rounded text-xs ${
                            stats.isAtLimit
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                    >
                        <span className="mr-1">💎</span>
                        {stats.upgradeMessage}
                    </div>
                )}

                {/* Compact warning when near limit */}
                {stats?.isNearLimit && !stats?.upgradeMessage && (
                    <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <span className="text-yellow-600 font-medium">
                            ⚠️ {stats.savedCount}/{stats.maxAllowed} slots used
                        </span>
                    </div>
                )}
            </div>

            {/* Jobs List */}
            <div className="p-6">
                {savedJobs.length === 0 ? (
                    <div className="text-center py-12">
                        <BookmarkCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            No Saved Jobs Yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Start saving jobs you're interested in to view them here.
                        </p>
                        {stats && (
                            <p className="text-sm text-gray-400">
                                You can save up to {stats.maxAllowed} jobs with your{" "}
                                {stats.subscription} plan
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedJobs.map((job) => (
                            <div
                                key={job._id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {/* Job Title and Company */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3
                                                className="font-semibold text-lg text-color cursor-pointer hover:text-primary transition-colors"
                                                onClick={() => onSelectJob(job)}
                                            >
                                                {job.title}
                                            </h3>
                                            {job.applicationStatus &&
                                                getApplicationStatusBadge(job.applicationStatus)}
                                        </div>

                                        <p className="text-gray-600 mb-2 font-medium">
                                            {job.company?.companyName}
                                        </p>

                                        {/* Job Details */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                                            {job.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>
                                                        {job.location.kabupaten?.name},{" "}
                                                        {job.location.provinsi?.name}
                                                    </span>
                                                </div>
                                            )}
                                            {job.salaryRange && job.salaryRange.min && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>
                                                        {job.salaryRange.currency}{" "}
                                                        {job.salaryRange.min?.toLocaleString()}
                                                        {job.salaryRange.max
                                                            ? ` - ${job.salaryRange.max?.toLocaleString()}`
                                                            : "+"}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>Saved {formatDate(job.savedAt)}</span>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        {job.requiredSkills?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {job.requiredSkills.slice(0, 3).map((skill) => (
                                                    <span
                                                        key={skill._id}
                                                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                                    >
                                                        {skill.name}
                                                    </span>
                                                ))}
                                                {job.requiredSkills.length > 3 && (
                                                    <span className="text-xs text-gray-500 px-2 py-1">
                                                        +{job.requiredSkills.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Job Description Preview */}
                                        {job.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {job.description.substring(0, 150)}
                                                {job.description.length > 150 && "..."}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => onSelectJob(job)}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                            title="View Details"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveSaved(job._id)}
                                            disabled={removing === job._id}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                            title="Remove from Saved"
                                        >
                                            {removing === job._id ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                            onClick={() => fetchSavedJobs(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => fetchSavedJobs(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                            page === pageNum
                                                ? "bg-primary text-white"
                                                : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && (
                                <>
                                    <span className="text-gray-400">...</span>
                                    <button
                                        onClick={() => fetchSavedJobs(totalPages)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                            page === totalPages
                                                ? "bg-primary text-white"
                                                : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => fetchSavedJobs(page + 1)}
                            disabled={page === totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Summary Footer */}
                {stats && savedJobs.length > 0 && (
                    <div className="mt-6 pt-4 border-t text-center">
                        <p className="text-sm text-gray-500">
                            Showing {savedJobs.length} of {stats.savedCount} saved jobs
                        </p>
                        {stats.subscription === "free" && stats.savedCount > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                💡 Free users can save up to {stats.maxAllowed} jobs
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
