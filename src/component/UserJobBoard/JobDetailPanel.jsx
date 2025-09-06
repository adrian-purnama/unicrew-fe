import { Send, Bookmark, BookmarkCheck, Star, MessageSquare } from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "../../../utils/UserContext";
import LoginForm from "../LoginForm";
import BaseModal from "../BaseModal";

export default function JobDetailPanel({ job, onApply, onSave, onUnsave }) {
    const { isLoggedIn } = useContext(UserContext)
    const [isSaving, setIsSaving] = useState(false);

    const [showLogin, setShowLogin] = useState(false);

    const handleApplyClick = () => {
        if (!isLoggedIn) {
            setShowLogin(true);
            return;
        }
        if (!job.hasApplied) onApply(job._id);
    };

    if (!job) return <p className="text-gray-400">Select a job to view details</p>;

    const handleSaveToggle = async () => {
        setIsSaving(true);
        try {
            if (job.isSaved) {
                await onUnsave(job._id);
            } else {
                await onSave(job._id);
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${index < Math.floor(rating)
                    ? "text-yellow-400 fill-current"
                    : index < rating
                        ? "text-yellow-400 fill-current opacity-50"
                        : "text-gray-300"
                    }`}
            />
        ));
    };

    return (
        <div className="bg-color-1 p-6 border border-gray rounded-xl max-h-[70vh] overflow-y-auto sleek-scrollbar">
            {/* Header with Save Button */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-color">{job.title}</h1>
                    <div className="flex flex-col gap-2 mt-1 mb-2">
                        <p className="text-sm text-gray">{job.company?.companyName}</p>
                        {job.company?.rating && job.company.rating.count > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                                <div className="flex items-center">
                                    {renderStars(job.company.rating.average)}
                                </div>
                                <span className="text-gray">
                                    {job.company.rating.average.toFixed(1)} ({job.company.rating.count} review{job.company.rating.count !== 1 ? 's' : ''})
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray">
                        {
                            [job?.location?.kabupaten?.name, job?.location?.provinsi?.name]
                                .filter(Boolean)
                                .join(", ")
                            || "Remote"
                        }
                    </p>

                </div>

                {/* Save Button */}
                <button
                    onClick={handleSaveToggle}
                    disabled={isSaving || (!job.canSaveMore && !job.isSaved)}
                    className={`ml-4 p-2 rounded-full transition-colors duration-200 ${job.isSaved
                        ? "bg-primary text-white hover:bg-primary-dark"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        } ${!job.canSaveMore && !job.isSaved
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                    title={
                        job.isSaved
                            ? "Remove from saved jobs"
                            : !job.canSaveMore
                                ? `Saved jobs limit reached (${job.userSavedCount}/${job.maxSavedAllowed}). ${job.userSubscription === 'free' ? 'Upgrade to premium for more saves.' : ''}`
                                : "Save this job"
                    }
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : job.isSaved ? (
                        <BookmarkCheck className="w-5 h-5" />
                    ) : (
                        <Bookmark className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Save Limit Warning for Free Users */}
            {job.userSubscription === 'free' && job.userSavedCount >= job.maxSavedAllowed - 1 && (
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 px-4 py-2 rounded text-sm">
                    <p className="font-semibold text-yellow-800">
                        {job.userSavedCount === job.maxSavedAllowed
                            ? "Saved jobs limit reached!"
                            : `Only ${job.maxSavedAllowed - job.userSavedCount} save${job.maxSavedAllowed - job.userSavedCount === 1 ? '' : 's'} remaining`
                        }
                    </p>
                    <p className="text-yellow-700">
                        Upgrade to premium to save up to 50 jobs!
                    </p>
                </div>
            )}

            {/* Why This Job Section */}
            {job.whyThisJob?.length > 0 && (
                <div className="mt-4 bg-primary-20 border-l-4 border-primary px-4 py-2 rounded text-sm">
                    <p className="font-semibold mb-1 text-primary">Why this job?</p>
                    <ul className="list-disc list-inside text-primary">
                        {job.whyThisJob.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Salary */}
            {job.salaryRange && (
                <p className="my-4 text-gray">
                    <strong className=" text-color">Salary:</strong> {job.salaryRange.currency}{" "}
                    {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                </p>
            )}

            {/* Required Skills */}
            {job.requiredSkills?.length > 0 && (
                <div className="mb-4">
                    <strong className="text-color">Skills:</strong>
                    <ul className="flex flex-wrap gap-2 mt-1">
                        {job.requiredSkills.map((skill) => (
                            <li
                                key={skill._id}
                                className="text-xs bg-primary-20 text-primary px-2 py-1 rounded-full"
                            >
                                {skill.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {job.description && (
                <div className="mb-4">
                    <strong className="text-color">Description:</strong>
                    <p>{job.description}</p>
                </div>
            )}

            {isLoggedIn ? (
                <>
                    {!job.hasApplied && (
                        <button
                            onClick={handleApplyClick}
                            className="mb-4 btn-primary text-white font-bold px-4 py-2 rounded flex items-center gap-2 w-full justify-center"
                        >
                            <Send className="w-4 h-4" /> Apply
                        </button>
                    )}

                    {job.hasApplied && (
                        <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded text-center">
                            <p className="font-semibold">✓ Already Applied</p>
                        </div>
                    )}
                </>
            ) : (
                // Logged out → show the same Apply button, but it opens the login modal
                <button
                    onClick={handleApplyClick}
                    className="mb-4 btn-primary text-white font-bold px-4 py-2 rounded flex items-center gap-2 w-full justify-center"
                >
                    <Send className="w-4 h-4" /> Apply
                </button>
            )}


            {/* Company Reviews Section */}
            {(job.latestReviews?.length ?? 0) > 0 && (
                <div className="">
                    <div className="flex items-center gap-2 mb-3">
                        {/* <MessageSquare className="w-5 h-5 text-blue-600" /> */}
                        <h3 className="text-lg font-semibold text-color">Recent Company Reviews</h3>
                    </div>

                    <div className="space-y-3">
                        {job.latestReviews.map((review, index) => (
                            <div
                                key={review._id || index}
                                className="bg-color-1 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {renderStars(review.rating)}
                                        </div>

                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>

                                {review.comment && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {job.company?.rating?.count > job.latestReviews.length && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Showing {job.latestReviews.length} of {job.company.rating.count} total reviews
                        </p>
                    )}
                </div>
            )}


            {/* Company Description */}
            {job.company?.description && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-color">About Company</h3>
                    <p className="text-sm text-gray">{job.company.description}</p>
                </div>
            )}


            {/* Company Reviews Section */}
            {job.companyReviews && job.companyReviews.length > 0 && (
                <div className="mb-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-5 h-5 color-primary" />
                        <h3 className="text-lg font-semibold text-color">Recent Company Reviews</h3>
                    </div>
                    <div className="space-y-3">
                        {job.companyReviews.map((review, index) => (
                            <div key={index} className="bg-color-2 p-3 rounded-lg border-gray">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className="text-sm font-medium text-gray">
                                            {review.reviewerName || 'Anonymous'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-gray leading-relaxed">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    {job.company?.rating?.count > job.companyReviews.length && (
                        <p className="text-xs text-gray mt-2 text-center">
                            Showing {job.companyReviews.length} of {job.company.rating.count} total reviews
                        </p>
                    )}
                </div>
            )}

            <BaseModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}   
                         >
                <LoginForm role="user" title="User" />
            </BaseModal>

        </div>
    );
}