import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../utils/ApiHelper";
import { UserContext } from "../../utils/UserContext";
import ProfileReminderModal from "./ProfileReminderModal";
import FilterPanel from "./FilterPanel";
import { Send, X } from "lucide-react";
import useIsMobile from "../../utils/useIsMobile";
import toast from "react-hot-toast";

export default function JobSplitView() {
    const { isLoggedIn, setIsProfileComplete } = useContext(UserContext);
    const [showModal, setShowModal] = useState(false);
    const [missingFields, setMissingFields] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem("unicru-job-filters");
        return saved ? JSON.parse(saved) : { page: 1, limit: 10 };
    });
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(false);

    const isMobile = useIsMobile();

    useEffect(() => {
        if (!isLoggedIn) return;
        const lastShown = localStorage.getItem("unicru-profile-reminder");
        const now = new Date();
        const oneDayPassed = !lastShown || now - new Date(lastShown) > 24 * 60 * 60 * 1000;

        if (!oneDayPassed) return;

        axiosInstance.get("/user/profile-check").then((res) => {
            const { isComplete, missingFields, completedPercentage } = res.data;
            setIsProfileComplete(isComplete);
            if (!isComplete) {
                setMissingFields(missingFields);
                setPercentage(completedPercentage);
                setShowModal(true);
            }
        });
    }, [isLoggedIn, setIsProfileComplete]);

    useEffect(() => {
        if (isLoggedIn) fetchJobs();
    }, [filters, isLoggedIn]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/company/job-feed", { params: filters });
            setJobs(res.data.jobs);
            console.log(res.data.jobs);
            setSelectedJob(res.data.jobs[0] || null);
            localStorage.setItem("unicru-job-filters", JSON.stringify(filters));
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (updatedFilters) => {
        setFilters((prev) => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleClose = () => {
        setShowModal(false);
        localStorage.setItem("unicru-profile-reminder", new Date().toISOString());
    };

    const formatSalaryRange = (salaryRange) => {
        if (!salaryRange || typeof salaryRange !== "object") return null;
        const { min, max, currency } = salaryRange;
        if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
        if (min) return `${currency} ${min.toLocaleString()}+`;
        if (max) return `Up to ${currency} ${max.toLocaleString()}`;
        return null;
    };

    const handleApply = async (jobId) => {
        try {
            const res = await axiosInstance.post("/company/apply", { jobId });
            toast.success("✅ " + res.data.message);

            setJobs((prev) => prev.filter((job) => job._id !== jobId));

            if (selectedJob?._id === jobId) {
                const remainingJobs = jobs.filter((job) => job._id !== jobId);
                setSelectedJob(remainingJobs[0] || null);
            }
        } catch (err) {
            const message = err.response?.data?.message || "❌ Failed to apply.";
            toast.error(message);
            console.error("Apply error:", err);
        }
    };

    const handleCloseMobileExpand = () => setSelectedJob(null);

    return (
        <>
            <div className="p-4 mx-auto">
                <h1 className="text-2xl font-bold mb-4">Recommended Jobs</h1>
                <FilterPanel filters={filters} onChange={handleFilterChange} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-3 overflow-y-auto max-h-[80vh] pr-2">
                        {loading ? (
                            <p>Loading jobs...</p>
                        ) : jobs.length === 0 ? (
                            <p>No jobs found with your current filters.</p>
                        ) : (
                            jobs.map((job) => (
                                <div
                                    key={job._id}
                                    className={`rounded-md p-4 transition-all duration-200${
                                        selectedJob?._id === job._id
                                            ? "ring-theme-primary bg-primary-20 ring-1 ring-theme-primary"
                                            : " border-1 border-color"
                                    }`}
                                >
                                    <div
                                        onClick={() => setSelectedJob(job)}
                                        className="cursor-pointer"
                                    >
                                        <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-1">
                                            {job.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 mb-1">
                                            {job.company?.companyName}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-1">
                                            {job.workType?.charAt(0).toUpperCase() +
                                                job.workType?.slice(1)}
                                        </p>
                                        {job.location && (
                                            <p className="text-sm text-gray-600 truncate">
                                                {job.location?.kabupaten?.name},{" "}
                                                {job.location?.provinsi?.name}
                                            </p>
                                        )}
                                    </div>

                                    {isMobile && selectedJob?._id === job._id && (
                                        <div className="mt-4 border-t pt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-lg font-semibold">
                                                    Job Details
                                                </h3>
                                                <button onClick={handleCloseMobileExpand}>
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                                                {job.description}
                                            </p>
                                            {job.salaryRange && (
                                                <p className="text-sm text-gray-700 mb-1">
                                                    <strong>Salary:</strong>{" "}
                                                    {formatSalaryRange(job.salaryRange)}
                                                </p>
                                            )}
                                            {job.requiredSkills?.length > 0 && (
                                                <div className="mb-2">
                                                    <strong className="text-sm">Skills:</strong>
                                                    <ul className="flex flex-wrap gap-2 mt-1">
                                                        {job.requiredSkills.map((skill) => (
                                                            <li
                                                                key={skill._id}
                                                                className="bg-blue-100 bg-primary-20 color-primary text-xs px-2 py-1 rounded-full"
                                                            >
                                                                {skill.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {job.company?.description && (
                                                <div className="mb-2">
                                                    <strong className="text-sm">
                                                        About {job.company.companyName}:
                                                    </strong>
                                                    <p className="text-sm text-gray-600">
                                                        {job.company.description}
                                                    </p>
                                                </div>
                                            )}
                                            {!job.hasApplied && (
                                                <button
                                                    onClick={() => handleApply(job._id)}
                                                    className="mt-4 text-sm rounded btn-primary flex items-center gap-2"
                                                >
                                                    <Send className="w-4 h-4" /> Apply
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {!isMobile && selectedJob && (
                        <div className="bg-white dark:bg-gray-900 border-1 border-color p-6 rounded-xl overflow-y-auto max-h-[80vh] relative">
                            <div className="mb-4">
                                <div className="flex items-start justify-between">
                                    <img
                                        src={selectedJob?.company?.profilePicture}
                                        alt="Company Logo"
                                        className="w-10"
                                    />
                                    <div>
                                        <h1 className="text-4xl font-bold">{selectedJob.title}</h1>
                                        <p className="text-gray-600 text-sm">
                                            {selectedJob.company?.companyName}
                                        </p>
                                        <div className="bg-blue-100 color-primary bg-primary-20 px-3 py-1 rounded-full text-xs font-medium w-fit">
                                            {selectedJob.workType?.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedJob.whyThisJob?.length > 0 && (
                                <div className="mt-2 bg-primary-20 border-l-4 border-primary px-4 py-2 rounded text-sm">
                                    <p className="font-semibold mb-1 color-primary">
                                        Why this job?
                                    </p>
                                    <ul className="list-disc list-inside color-primary">
                                        {selectedJob.whyThisJob.map((reason, idx) => (
                                            <li key={idx}>{reason}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedJob.location && (
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold">Location</h2>
                                    <p className="text-sm text-gray-600">
                                        {selectedJob.location?.provinsi?.name},{" "}
                                        {selectedJob.location?.kabupaten?.name}
                                    </p>
                                </div>
                            )}

                            {selectedJob.salaryRange && (
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold">Salary</h2>
                                    <p className="text-sm text-gray-700">
                                        {formatSalaryRange(selectedJob.salaryRange)}
                                    </p>
                                </div>
                            )}

                            {selectedJob.requiredSkills?.length > 0 && (
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold">Skills Required</h2>
                                    <ul className="flex flex-wrap gap-2">
                                        {selectedJob.requiredSkills.map((skill) => (
                                            <li
                                                key={skill._id}
                                                className="bg-blue-100 bg-primary-20 color-primary text-xs px-2 py-1 rounded-full font-semibold"
                                            >
                                                {skill.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedJob.description && (
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold">Description</h2>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {selectedJob.description}
                                    </p>
                                </div>
                            )}

                            {selectedJob.company?.description && (
                                <div className="mt-4">
                                    <h2 className="text-lg font-semibold">
                                        About {selectedJob.company.companyName}
                                    </h2>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {selectedJob.company.description}
                                    </p>
                                </div>
                            )}

                            {!selectedJob.hasApplied && (
                                <button
                                    onClick={() => handleApply(selectedJob._id)}
                                    className="mt-6 text-sm px-4 py-2 rounded btn-primary flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" /> Apply
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isLoggedIn && showModal && (
                <ProfileReminderModal
                    missingFields={missingFields}
                    percentage={percentage}
                    onClose={handleClose}
                />
            )}
        </>
    );
}
