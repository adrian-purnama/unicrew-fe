import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/ApiHelper";
import ChatModal from "../../component/ChatModal";
import BaseModal from "../../component/BaseModal";
import toast from "react-hot-toast";

export default function CompanyJobDetailPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [selected, setSelected] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [activeTab, setActiveTab] = useState("applied");
    const [activeChatRoom, setActiveChatRoom] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!jobId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [jobRes, appRes, reviewRes] = await Promise.all([
                    axiosInstance.get(`/company/job/${jobId}`),
                    axiosInstance.get(`/company/job/${jobId}/applicants`),
                    axiosInstance.get(`/company/pending-reviews`),
                ]);

                setJob(jobRes.data);
                setApplicants(appRes.data);

                // Filter pending reviews for only this job
                const filteredPending = reviewRes.data.filter((app) => app.job._id === jobId);
                setPendingReviews(filteredPending);
            } catch (err) {
                console.error("❌ Error loading job, applicants, or reviews:", err);
                toast.error("Failed to load job details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId]);

    const toggleSelect = (userId) => {
        setSelected((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const toggleSelectAll = (userIds) => {
        if (selected.length === userIds.length) {
            setSelected([]);
        } else {
            setSelected(userIds);
        }
    };

    const updateStatus = async (status, userIds = selected) => {
        if (!userIds || userIds.length === 0) {
            toast.error("Please select applicants first");
            return;
        }

        try {
            await axiosInstance.patch(`/company/job/${jobId}/applicants/status`, {
                user: userIds,
                status,
            });

            setSelected([]);
            toast.success(`Successfully ${status} ${userIds.length} applicant(s)`);

            const refreshed = await axiosInstance.get(`/company/job/${jobId}/applicants`);
            setApplicants(refreshed.data);
        } catch (err) {
            console.error(`❌ Failed to update status "${status}":`, err);
            toast.error(`Failed to update status to ${status}`);
        }
    };

    const handleReviewSubmit = async (applicationId, rating, comment) => {
        try {
            await axiosInstance.post("/company/review", {
                applicationId,
                rating,
                comment,
            });
            
            // Remove from pending reviews
            setPendingReviews(prev => prev.filter(item => item._id !== applicationId));
            toast.success("Review submitted successfully!");
            setSelectedReview(null);
        } catch (err) {
            console.error("Failed to submit review:", err);
            toast.error("Failed to submit review");
        }
    };

    const grouped = {
        applied: [],
        shortListed: [],
        accepted: [],
        rejected: [],
    };

    applicants.forEach((app) => {
        if (grouped[app.status]) {
            grouped[app.status].push(app);
        }
    });

    const openChatRoom = (chatRoom) => {
        if (!chatRoom || (!chatRoom._id && typeof chatRoom !== "string")) {
            toast.error("❌ Chat room not found yet. Please try again shortly.");
            return;
        }

        const roomId = typeof chatRoom === "string" ? chatRoom : chatRoom._id;
        setActiveChatRoom(roomId);
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            applied: "bg-primary-20 text-primary border-primary",
            shortListed: "bg-yellow-100 text-yellow-800 border-yellow-200",
            accepted: "bg-green-100 text-green-800 border-green-200",
            rejected: "bg-red-100 text-red-800 border-red-200",
        };
        return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const renderActionButtons = (app, phase) => {
        const buttonClass = "text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:shadow-md transform hover:scale-105";
        
        return (
            <div className="flex flex-wrap gap-2 items-center">
                {phase === "applied" && (
                    <>
                        <button
                            onClick={() => updateStatus("shortListed", [app.user._id])}
                            className={`${buttonClass} btn-primary text-white`}
                        >
                            ✨ Shortlist
                        </button>
                        <button
                            onClick={() => updateStatus("rejected", [app.user._id])}
                            className={`${buttonClass} bg-red-500 text-white hover:bg-red-600`}
                        >
                            ❌ Reject
                        </button>
                    </>
                )}
                
                {(phase === "shortListed" || phase === "accepted") && (
                    <>
                        {phase === "shortListed" && (
                            <button
                                onClick={() => updateStatus("accepted", [app.user._id])}
                                className={`${buttonClass} bg-green-600 text-white hover:bg-green-700`}
                            >
                                ✅ Accept
                            </button>
                        )}
                        <button
                            onClick={() => updateStatus("rejected", [app.user._id])}
                            className={`${buttonClass} bg-red-500 text-white hover:bg-red-600`}
                        >
                            ❌ Reject
                        </button>
                        <button
                            onClick={() => openChatRoom(app.chatRoom)}
                            className={`${buttonClass} btn-highlight text-white`}
                        >
                            💬 Message
                        </button>
                    </>
                )}
                
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selected.includes(app.user._id)}
                        onChange={() => toggleSelect(app.user._id)}
                        className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all transform hover:scale-110 ${
                        selected.includes(app.user._id) 
                            ? 'bg-primary border-primary text-white' 
                            : 'border-gray hover:border-primary'
                    }`}>
                        {selected.includes(app.user._id) && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                </label>
            </div>
        );
    };

    const renderApplicantCard = (app, phase) => (
        <div
            key={app._id}
            className="bg-color-2 rounded-xl p-6 border border-gray shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary transform hover:-translate-y-1"
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-highlight rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {app.user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-color">
                                {app.user.fullName}
                            </h3>
                            <p className="text-sm text-gray">{app.user.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                    </div>

                    {/* Match Score */}
                    {app.match && (
                        <div className={`p-3 rounded-lg mb-3 ${
                            app.match.percent >= 70
                                ? "bg-green-50 border border-green-200"
                                : app.match.percent >= 40
                                ? "bg-yellow-50 border border-yellow-200"
                                : "bg-red-50 border border-red-200"
                        }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    app.match.percent >= 70 ? "bg-green-500" : app.match.percent >= 40 ? "bg-yellow-500" : "bg-red-500"
                                }`}></div>
                                <span className="text-sm font-medium">Match Score: {app.match.percent}%</span>
                            </div>
                            {Array.isArray(app.match.reasons) && app.match.reasons.length > 0 && (
                                <ul className="text-xs space-y-1">
                                    {app.match.reasons.map((reason, idx) => (
                                        <li key={idx} className="flex items-start gap-1">
                                            <span className="text-gray-400 mt-0.5">•</span>
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Skills */}
                    {app.user.skills?.length > 0 && (
                        <div className="mb-3">
                            <p className="text-sm font-medium text-gray mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {app.user.skills.slice(0, 6).map((skill) => (
                                    <span
                                        key={skill._id}
                                        className="bg-primary-20 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary"
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                                {app.user.skills.length > 6 && (
                                    <span className="text-xs text-gray py-1">
                                        +{app.user.skills.length - 6} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {app.user.university && (
                        <div className="mb-3 text-sm">
                            <span className="text-primary">🎓 </span>
                            <span className="font-medium text-color">{app.user.studyProgram?.name}</span>
                            <span className="text-gray"> at {app.user.university.name}</span>
                        </div>
                    )}

                    {/* Documents */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {app.user.curriculumVitae && (
                            <a
                                href={app.user.curriculumVitae}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-primary-20 hover:bg-primary-50 text-primary text-sm px-3 py-1.5 rounded-lg transition-all duration-200 border border-primary"
                            >
                                📄 View CV
                            </a>
                        )}
                        {app.user.portfolio && (
                            <a
                                href={app.user.portfolio}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm px-3 py-1.5 rounded-lg transition-all duration-200 border border-purple-300"
                            >
                                🎨 Portfolio
                            </a>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    {renderActionButtons(app, phase)}
                </div>
            </div>
        </div>
    );

    const renderSection = (users, phase) => {
        if (loading) {
            return (
                <div className="space-y-4 mt-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
                    ))}
                </div>
            );
        }

        return (
            <div className="mt-4">
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4 animate-pulse">📭</div>
                        <p className="text-gray text-lg">No applicants in this stage</p>
                        <p className="text-gray text-sm">Applicants will appear here when they apply or get moved to this stage</p>
                    </div>
                ) : (
                    <>
                        {/* Bulk Actions */}
                        {users.length > 0 && (
                            <div className="bg-primary-20 p-4 rounded-lg mb-4 border border-primary">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selected.length === users.map(u => u.user._id).length}
                                            onChange={() => toggleSelectAll(users.map(u => u.user._id))}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all transform hover:scale-110 ${
                                            selected.length === users.map(u => u.user._id).length
                                                ? 'bg-primary border-primary text-white' 
                                                : 'border-primary hover:bg-primary-20'
                                        }`}>
                                            {selected.length === users.map(u => u.user._id).length && (
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-primary">
                                            Select All ({users.length})
                                        </span>
                                    </label>
                                    
                                    {selected.length > 0 && (
                                        <div className="flex gap-2">
                                            <span className="text-sm text-primary py-2 font-medium">
                                                {selected.length} selected
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {users.map((app) => renderApplicantCard(app, phase))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderReviewSection = () => (
        <div className="mt-4">
            {pendingReviews.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4 animate-bounce">⭐</div>
                    <p className="text-gray text-lg">No pending reviews</p>
                    <p className="text-gray text-sm">Reviews will appear here for completed applications</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingReviews.map((app) => (
                        <div
                            key={app._id}
                            className="bg-color-2 rounded-xl p-6 border border-gray shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {app.user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-color">
                                            {app.user.fullName}
                                        </h3>
                                        <p className="text-sm text-gray">{app.user.email}</p>
                                        <p className="text-xs text-gray mt-1">
                                            Application completed • Awaiting review
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedReview(app)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    ⭐ Leave Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const tabs = [
        { key: "applied", label: "Applied", count: grouped.applied.length, icon: "📥" },
        { key: "shortListed", label: "Shortlisted", count: grouped.shortListed.length, icon: "✨" },
        { key: "accepted", label: "Accepted", count: grouped.accepted.length, icon: "✅" },
        { key: "rejected", label: "Rejected", count: grouped.rejected.length, icon: "❌" },
        { key: "review", label: "Reviews", count: pendingReviews.length, icon: "⭐" },
    ];

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="flex space-x-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto bg-color-1 min-h-screen">
            {/* Job Header */}
            {job && (
                <div className="bg-color-2 rounded-xl p-6 mb-6 shadow-sm border border-gray relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-highlight"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-color mb-2">
                                {job.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray">
                                <span className="flex items-center gap-1 text-primary">
                                    🧑‍💻 {job.workType}
                                </span>
                                {job.location && (
                                    <span className="flex items-center gap-1">
                                        📍 {[
                                            job.location.kecamatan?.name,
                                            job.location.kabupaten?.name,
                                            job.location.provinsi?.name,
                                        ].filter(Boolean).join(", ")}
                                    </span>
                                )}
                                {job.salaryRange && (
                                    <span className="flex items-center gap-1 text-green-600">
                                        💰 {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()} {job.salaryRange.currency || "IDR"}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-color-1 hover:bg-primary-20 text-color border border-gray hover:border-primary px-4 py-2 rounded-lg transition-all duration-200"
                        >
                            ← Back
                        </button>
                    </div>

                    <p className="text-color mb-4 leading-relaxed">
                        {job.description}
                    </p>

                    {job.requiredSkills?.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray mb-2">Required Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map((skill) => (
                                    <span
                                        key={skill._id}
                                        className="bg-primary-20 text-primary text-sm font-medium px-3 py-1 rounded-full border border-primary"
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-color-2 rounded-xl mb-6 shadow-sm border border-gray overflow-hidden">
                <div className="flex overflow-x-auto">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap group ${
                                activeTab === tab.key 
                                    ? "text-primary bg-primary-20" 
                                    : "text-gray hover:text-primary hover:bg-color-1"
                            }`}
                        >
                            <span className="text-xl group-hover:scale-125 transition-transform duration-200">{tab.icon}</span>
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    activeTab === tab.key 
                                        ? "bg-primary text-white" 
                                        : "bg-gray-200 text-gray-700"
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-highlight"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-color-2 rounded-xl shadow-sm border border-gray p-6">
                {activeTab === "review" ? renderReviewSection() : renderSection(grouped[activeTab], activeTab)}
            </div>

            {/* Bulk Actions */}
            {selected.length > 0 && activeTab !== "review" && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-color-2 rounded-xl shadow-2xl border border-primary p-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-primary">
                            {selected.length} applicant(s) selected
                        </span>
                        <div className="flex gap-2">
                            {activeTab === "applied" && (
                                <button
                                    onClick={() => updateStatus("shortListed")}
                                    className="btn-primary text-white text-sm font-medium transition-all duration-200"
                                >
                                    Shortlist Selected
                                </button>
                            )}
                            {(activeTab === "applied" || activeTab === "shortListed") && (
                                <button
                                    onClick={() => updateStatus("accepted")}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                >
                                    Accept Selected
                                </button>
                            )}
                            <button
                                onClick={() => updateStatus("rejected")}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                Reject Selected
                            </button>
                            <button
                                onClick={() => setSelected([])}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {selectedReview && (
                <BaseModal
                    isOpen={true}
                    onClose={() => setSelectedReview(null)}
                    title="Write a Review"
                >
                    <ReviewForm
                        application={selectedReview}
                        onSubmit={handleReviewSubmit}
                        onCancel={() => setSelectedReview(null)}
                    />
                </BaseModal>
            )}

            {/* Chat Modal */}
            <ChatModal
                roomId={activeChatRoom}
                isOpen={!!activeChatRoom}
                onClose={() => setActiveChatRoom(null)}
            />
        </div>
    );
}

function ReviewForm({ application, onSubmit, onCancel }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        onSubmit(application._id, rating, comment);
    };

    return (
        <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-primary-20 rounded-lg border border-primary">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-highlight rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {application.user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-semibold text-color">
                        {application.user.fullName}
                    </h3>
                    <p className="text-sm text-gray">
                        {application.user.email}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray mb-3">
                        How would you rate this candidate?
                    </label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className={`text-3xl transition-all duration-200 hover:scale-110 ${
                                    star <= (hoveredRating || rating) 
                                        ? "text-yellow-400" 
                                        : "text-gray-300 hover:text-yellow-300"
                                }`}
                            >
                                ★
                            </button>
                        ))}
                        <span className="ml-3 text-sm text-gray">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent"}
                        </span>
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray mb-2">
                        Review Comments
                    </label>
                    <textarea
                        className="w-full border border-gray rounded-lg px-4 py-3 text-color bg-color-1 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                        rows="4"
                        placeholder="Share your experience working with this candidate (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <p className="text-xs text-gray mt-1">
                        This review will help other employers make informed decisions.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        Submit Review
                    </button>
                </div>
            </form>
        </div>
    );
}