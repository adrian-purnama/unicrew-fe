import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import JobDetailPanel from "./JobDetailPanel";

export default function JobListPanel({
    jobs,
    loading,
    activeTab,
    onSelectJob,
    selectedJob,
    isMobile,
    onSave,
    onUnsave,
    onApply,
}) {
    const [savingJobs, setSavingJobs] = useState(new Set());

    const handleSaveToggle = async (e, job) => {
        e.stopPropagation(); // Prevent job selection

        if (!job.isSaved && !job.canSaveMore) {
            // Show a toast or alert
            alert(
                `❌ You've reached your saved jobs limit (${job.userSavedCount}/${job.maxSavedAllowed}).`
            );
            return;
        }

        setSavingJobs((prev) => new Set([...prev, job._id]));

        try {
            if (job.isSaved) {
                await onUnsave(job._id);
            } else {
                await onSave(job._id);
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        } finally {
            setSavingJobs((prev) => {
                const newSet = new Set(prev);
                newSet.delete(job._id);
                return newSet;
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="bg-color-2 rounded-xl border p-6">
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

    if (jobs.length === 0) {
        return (
            <div className="bg-color-2 rounded-xl border p-8 text-center">
                <div className="text-gray-400 mb-4">
                    <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5M8 6V4h8v2M8 6v10.5"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Jobs Found</h3>
                <p className="text-gray-500">
                    {activeTab === "find"
                        ? "Try adjusting your search filters to find more opportunities."
                        : "No jobs in this category yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2 max-h-[70vh] overflow-y-auto sleek-scrollbar">
            {jobs.map((job) => {
                const isSelected = selectedJob?._id === job._id;
                const isSaving = savingJobs.has(job._id);

                return (
                    <div
                        key={job._id}
                        onClick={() => onSelectJob(job)}
                        className={`p-4 cursor-pointer transition-all duration-200 relative border rounded-lg ${isSelected
                                ? "bg-primary-10 border-primary shadow-sm"
                                : "bg-color-1 border-gray-300 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                            }`}
                    >
                        {/* Save Button */}
                        <button
                            onClick={(e) => handleSaveToggle(e, job)}
                            disabled={isSaving}
                            className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors duration-200
        ${job.isSaved
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                                }
        ${!job.canSaveMore && !job.isSaved ? "opacity-50 cursor-help" : ""}
    `}
                            title={
                                job.isSaved
                                    ? "Remove from saved jobs"
                                    : !job.canSaveMore
                                        ? `Saved jobs limit reached (${job.userSavedCount}/${job.maxSavedAllowed})`
                                        : "Save this job"
                            }
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : job.isSaved ? (
                                <BookmarkCheck className="w-4 h-4" />
                            ) : (
                                <Bookmark className="w-4 h-4" />
                            )}
                        </button>

                        {/* Job List Summary */}
                        <div className="pr-12">
                            <div className="mb-2">
                                <h3 className="font-semibold text-lg text-color mb-1">
                                    {job.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {job.company?.companyName || job.company?.name}
                                </p>
                            </div>

                            <div className="space-y-1 text-sm text-gray mb-3">
                                {job.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">
                                            {job.workType === "remote"
                                                ? "Remote"
                                                : `${job.location.kabupaten?.name}, ${job.location.provinsi?.name}`}
                                        </span>
                                    </div>
                                )}
                                {job.salaryRange && (
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-4 h-4 flex-shrink-0" />
                                        <span>
                                            {job.salaryRange.currency}{" "}
                                            {job.salaryRange.min.toLocaleString()} -{" "}
                                            {job.salaryRange.max.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span>{formatDate(job.createdAt)}</span>
                                </div>
                            </div>

                            {job.matchScore !== undefined && (
                                <div className="mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray">
                                            Match:
                                        </span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(100, job.matchScore)}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-semibold text-primary">
                                            {Math.round(job.matchScore)}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {job.requiredSkills?.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-1">
                                        {job.requiredSkills.slice(0, 3).map((skill) => (
                                            <span
                                                key={skill._id}
                                                className="text-xs bg-primary-20 text-primary px-2 py-1 rounded-full"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                        {job.requiredSkills.length > 3 && (
                                            <span className="text-xs text-gray px-2 py-1">
                                                +{job.requiredSkills.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-gray line-clamp-2">
                                {job.description?.substring(0, 120)}
                                {job.description?.length > 120 && "..."}
                            </p>

                            {job.hasApplied && (
                                <div className="mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Applied
                                    </span>
                                </div>
                            )}

                            {job.whyThisJob?.length > 0 && (
                                <div className="mt-2 text-xs text-primary">
                                    <span className="font-medium">Why this job: </span>
                                    <span>{job.whyThisJob[0]}</span>
                                    {job.whyThisJob.length > 1 && (
                                        <span className="text-gray-500">
                                            {" "}
                                            +{job.whyThisJob.length - 1} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Inline Expanded Job Detail (on smaller screens only) */}
                        {isMobile && isSelected && (
                            <div className="mt-4">
                                <JobDetailPanel
                                    job={selectedJob}
                                    onApply={() => onApply(job._id)}
                                    onSave={() => onSave(job._id)}
                                    onUnsave={() => onUnsave(job._id)}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
