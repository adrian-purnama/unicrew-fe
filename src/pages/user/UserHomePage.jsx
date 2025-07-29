import { useEffect, useState, useContext } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import { UserContext } from "../../../utils/UserContext";
import ProfileReminderModal from "../../component/ProfileReminderModal";
import JobSplitView from "../../component/JobSplitView";
import Navigation from "../../component/Navigation";
import ChatModal from "../../component/ChatModal";
import toast from "react-hot-toast";

const LOCAL_STORAGE_KEY = "unicru-job-filters";

const UserHomePage = () => {
    const { isLoggedIn, setIsProfileComplete } = useContext(UserContext);

    const [activeTab, setActiveTab] = useState("find"); // 'find' or 'accepted'
    const [showModal, setShowModal] = useState(false);
    const [missingFields, setMissingFields] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const [filters, setFilters] = useState(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : { page: 1, limit: 10 };
    });

    const [jobs, setJobs] = useState([]);
    const [acceptedJobs, setAcceptedJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeChatRoom, setActiveChatRoom] = useState(null);

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
        if (!isLoggedIn) return;

        if (activeTab === "find") {
            fetchJobs();
        } else if (activeTab === "accepted") {
            fetchAcceptedJobs();
        }
    }, [isLoggedIn, filters, activeTab]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/company/job-feed", { params: filters });
            setJobs(res.data.jobs);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filters));
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAcceptedJobs = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                "/company/my-applications?status=shortListed,accepted"
            );
            console.log("📥 acceptedJobs response:", res.data); // 👈 Log full response
            setAcceptedJobs(res.data);
        } catch (err) {
            console.error("Failed to fetch accepted jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (updatedFilters) => {
        setFilters((prev) => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleCloseReminder = () => {
        setShowModal(false);
        localStorage.setItem("unicru-profile-reminder", new Date().toISOString());
    };

    const handleApply = async (jobId) => {
        try {
            await axiosInstance.post("/company/apply", { jobId });
            setJobs((prev) => prev.filter((job) => job._id !== jobId));

            toast.success("✅ Successfully applied to the job.");
        } catch (err) {
            console.error("Failed to apply:", err);
            toast.error("❌ Something went wrong while applying.");
        }
    };

    return (
        <>
            <Navigation />

            <div className="p-4 max-w-6xl mx-auto">
                {/* Tabs */}
                <div className="flex border-b border-color gap-6 mb-6">
                    {[
                        { key: "find", label: "Find Jobs" },
                        { key: "accepted", label: "Accepted Jobs" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative pb-2 font-medium transition-all duration-300 ${
                                activeTab === tab.key ? "text-primary" : "text-gray-500"
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.key && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-all duration-300"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {loading ? (
                    <p>Loading...</p>
                ) : activeTab === "find" ? (
                    jobs.length === 0 ? (
                        <p>No jobs found with your current filters.</p>
                    ) : (
                        <JobSplitView
                            jobs={jobs}
                            onApply={handleApply}
                            onFilterChange={handleFilterChange}
                        />
                    )
                ) : acceptedJobs.length === 0 ? (
                    <p>No accepted or shortlisted jobs yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {acceptedJobs.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white dark:bg-gray-900 border dark:border-gray-700 p-4 rounded-xl shadow hover:shadow-lg transition"
                            >
                                <h3 className="font-semibold text-lg">{item.job?.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Company: {item.company?.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Status:{" "}
                                    <span
                                        className={`font-semibold ${
                                            item.status === "shortListed"
                                                ? "text-blue-500"
                                                : item.status === "accepted"
                                                ? "text-green-500"
                                                : ""
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </p>

                                <button
                                    onClick={() => {
                                        if (!item.chatRoom || !item.chatRoom._id) {
                                            toast.error("❌ Chat room not available yet.");
                                        } else {
                                            setActiveChatRoom(item.chatRoom._id);
                                        }
                                    }}
                                    className="btn-primary text-sm px-4 py-2 rounded mt-2"
                                >
                                    💬 Message
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Profile Reminder Modal */}
            {isLoggedIn && showModal && (
                <ProfileReminderModal
                    missingFields={missingFields}
                    percentage={percentage}
                    onClose={handleCloseReminder}
                />
            )}

            {/* Chat Modal */}
            {activeChatRoom && (
                <ChatModal
                    roomId={activeChatRoom}
                    isOpen={!!activeChatRoom}
                    onClose={() => setActiveChatRoom(null)}
                />
            )}
        </>
    );
};

export default UserHomePage;
