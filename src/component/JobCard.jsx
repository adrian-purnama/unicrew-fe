import { useState } from "react";
import { Trash2, Bell, EyeOff, Eye } from "lucide-react";
import axiosInstance from "../../utils/ApiHelper";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function JobCard({ job, mode, onDelete, onToggleStatus, notificationCount = 0 }) {
    const [isActive, setIsActive] = useState(job.isActive);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const isDisabled = !isActive;

    const toggleStatus = async () => {
        try {
            setLoading(true);
            const endpoint = isActive
                ? `/company/job/${job._id}/disable`
                : `/company/job/${job._id}/enable`;

            await axiosInstance.patch(endpoint);
            setIsActive((prev) => !prev);

            toast.success(`✅ Job has been ${isActive ? "disabled" : "enabled"} successfully.`);

            if (onToggleStatus) onToggleStatus(job._id, !isActive);
        } catch (err) {
            console.error("❌ Failed to toggle job status:", err.message);
            toast.error("❌ Failed to update job status.");
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/company/job/${job._id}`);
    };

    return (
        <div
            className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition w-full max-w-2xl mx-auto ${
                isDisabled ? "opacity-50" : ""
            }`}
        >
            <h2 className="text-xl font-bold flex justify-between items-center text-primary">
                {job.title}
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {isActive ? "Active" : "Disabled"}
                </span>
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">
                {job.workType}
                {job.workType !== "remote" && job.location && (
                    <>
                        {" "}
                        • {job.location?.provinsi?.name}, {job.location?.kabupaten?.name},{" "}
                        {job.location?.kecamatan?.name}
                    </>
                )}
            </p>

            <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                <strong>Skills:</strong> {job.requiredSkills.map((s) => s.name || s).join(", ")}
            </div>

            {job.salaryRange && (
                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                    <strong>Salary:</strong> {job.salaryRange.currency}{" "}
                    {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                </p>
            )}

            {job.description && (
                <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
                    {job.description}
                </p>
            )}

            {mode === "company" && job.statusCounts && (
                <div className="text-sm text-gray-600 flex gap-4 mt-2">
                    <strong className="text-sm text-gray-600">Status: </strong>
                    <span className="text-amber-400 font-semibold">
                        Applied: {job.statusCounts.applied}
                    </span>
                    -
                    <span className="text-blue-400 font-semibold">
                        Shortlisted: {job.statusCounts.shortListed}
                    </span>
                    -
                    <span className="text-green-400 font-semibold">
                        Accepted: {job.statusCounts.accepted}
                    </span>
                    -
                    <span className="text-red-400 font-semibold">
                        Rejected: {job.statusCounts.rejected}
                    </span>
                </div>
            )}

            <p className="text-sm btn-primary mt-2 cursor-pointer w-fit" onClick={handleCardClick}>
                View Detail
            </p>

            <div className="flex items-center flex-wrap gap-3 mt-5">
                <button
                    onClick={toggleStatus}
                    disabled={loading}
                    className={`text-sm px-4 py-2 rounded text-white flex items-center gap-1 transition ${
                        isActive
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                    {isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isActive ? "Disable" : "Enable"}
                </button>

                <button
                    onClick={() => onDelete?.(job._id)}
                    className="text-sm px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                >
                    <Trash2 className="w-4 h-4" /> Delete
                </button>

                {notificationCount > 10 && (
                    <div className="ml-auto relative">
                        <button className="text-gray-600 dark:text-gray-300 hover:text-red-500 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 rounded-full">
                                {notificationCount}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
