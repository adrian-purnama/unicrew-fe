import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import { MessageCircle, X, Clock, Star, Building, MapPin } from "lucide-react";

export default function PendingJobs({ setActiveChatRoom }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        applied: true,
        shortListed: true,
    });

    const fetchJobs = () => {
        const statusFilter = Object.entries(filters)
            .filter(([, isChecked]) => isChecked)
            .map(([status]) => status)
            .join(",");

        setLoading(true);
        axiosInstance
            .get("/applicant/my-applications", {
                params: { status: statusFilter },
            })
            .then((res) => setJobs(res.data))
            .catch((err) => {
                toast.error("Failed to fetch pending jobs.");
                console.error(err);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchJobs();
    }, [filters]);

    const handleCancel = async (jobId) => {
        try {
            await axiosInstance.post("/applicant/cancel-apply", { jobId });
            toast.success("Application cancelled.");
            fetchJobs(); // Refresh
        } catch (err) {
            toast.error("Failed to cancel application.");
            console.error(err);
        }
    };

    const getStatusIcon = (status) => {
        if (status === "shortListed") return <Star className="w-4 h-4" />;
        if (status === "accepted") return <CheckCircle className="w-4 h-4" />;
        return <Clock className="w-4 h-4" />;
    };

    const getStatusStyle = (status) => {
        if (status === "shortListed") return "bg-yellow-100 text-yellow-800 border-yellow-300";
        if (status === "accepted") return "bg-green-100 text-green-800 border-green-300";
        return "bg-primary-20 text-primary border-primary";
    };

    if (loading) {
        return (
            <div className="bg-color-2 rounded-xl border border-gray p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-gray rounded-lg p-4">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="bg-color-2 rounded-xl border border-gray p-12 text-center">
                <Clock className="w-16 h-16 mx-auto text-gray opacity-30 mb-4" />
                <h3 className="text-lg font-semibold text-color mb-2">No Pending Applications</h3>
                <p className="text-gray">Your pending applications will appear here.</p>
            </div>
        );
    }

    return (
        <div className="bg-color-2 rounded-xl border border-gray p-6">
            {/* Filters */}
            <div className="flex gap-4 mb-6 pb-4 border-b border-gray">
                {["applied", "shortListed"].map((status) => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={filters[status]}
                            onChange={() =>
                                setFilters((prev) => ({
                                    ...prev,
                                    [status]: !prev[status],
                                }))
                            }
                            className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            filters[status]
                                ? 'bg-primary border-primary text-white'
                                : 'border-gray group-hover:border-primary'
                        }`}>
                            {filters[status] && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm font-medium text-color group-hover:text-primary transition-colors">
                            {status === "shortListed" ? "Shortlisted" : "Applied"}
                        </span>
                    </label>
                ))}
            </div>

            {/* Job Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((item) => (
                    <div
                        key={item._id}
                        className="bg-color-1 border border-gray rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-primary group"
                    >
                        {/* Job Title & Company */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-lg text-color group-hover:text-primary transition-colors mb-2">
                                {item.job?.title}
                            </h3>
                            <div className="flex items-center gap-2 text-gray text-sm mb-1">
                                <Building className="w-4 h-4" />
                                <span>{item.company?.name}</span>
                            </div>
                            {item.job?.location && (
                                <div className="flex items-center gap-2 text-gray text-sm">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        {item.job.location.kabupaten?.name}, {item.job.location.provinsi?.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                                {getStatusIcon(item.status)}
                                {item.status === "shortListed"
                                    ? "Shortlisted"
                                    : item.status === "accepted"
                                    ? "Accepted"
                                    : "Applied"}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            {/* Show Message Button only when shortListed or accepted */}
                            {(item.status === "shortListed" || item.status === "accepted") && (
                                <button
                                    onClick={() => {
                                        if (!item.chatRoom || !item.chatRoom._id) {
                                            toast.error("Chat room not available.");
                                        } else {
                                            setActiveChatRoom(item.chatRoom._id);
                                        }
                                    }}
                                    className="btn-primary text-white text-sm px-4 py-2 rounded-lg w-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Message Employer
                                </button>
                            )}

                            {/* Show Cancel Button only when applied */}
                            {item.status === "applied" && (
                                <button
                                    onClick={() => handleCancel(item.job?._id)}
                                    className="bg-color-2 text-red-600 border border-red-300 hover:bg-red-50 text-sm px-4 py-2 rounded-lg w-full flex items-center justify-center gap-2 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel Application
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}