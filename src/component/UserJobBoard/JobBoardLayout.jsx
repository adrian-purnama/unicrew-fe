import { useEffect, useState } from "react";
import FilterPanel from "./FilterPanel";
import TabHeader from "./TabHeader";
import JobListPanel from "./JobListPanel";
import JobDetailPanel from "./JobDetailPanel";
import SearchBar from "./SearchBar";
import useJobData from "./useJobData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import PendingJobs from "./PendingJobs";
import AcceptedJobs from "./AcceptedJobs";
import SavedJobs from "./SavedJobs";
import useIsNonDesktop from "../../../utils/useIsNonDesktop";
import PendingReview from "./PendingReview";

export default function JobBoardLayout({ setActiveChatRoom }) {
    const [activeTab, setActiveTab] = useState("find");
    const [selectedJob, setSelectedJob] = useState(null);
    const [filters, setFilters] = useState({});
    const [searchInput, setSearchInput] = useState("");
    const { jobs, loading, fetchJobs, updateJobInList } = useJobData();
    const [showFilter, setShowFilter] = useState(true);

    const isNonDesktop = useIsNonDesktop();

    const isJobDetailVisible = selectedJob !== null && !isNonDesktop;

    useEffect(() => {
        if (activeTab === "find") {
            fetchJobs(activeTab, filters);
        }
    }, [activeTab, filters]);

    const handleApply = async (jobId) => {
        try {
            const res = await axiosInstance.post("/company/apply", { jobId });
            toast.success("✅ " + res.data.message);

            fetchJobs(activeTab, filters);

            if (selectedJob?._id === jobId) {
                setSelectedJob(null);
            }
        } catch (err) {
            const message = err.response?.data?.message || "❌ Failed to apply.";
            toast.error(message);
            console.error("Apply error:", err);
        }
    };

    const handleSaveJob = async (jobId) => {
        try {
            const res = await axiosInstance.post("/company/save-job", { jobId });
            toast.success("✅ " + res.data.message);

            // Update the job in the list to reflect the saved status
            updateJobInList(jobId, { 
                isSaved: true,
                userSavedCount: res.data.savedCount,
                canSaveMore: res.data.savedCount < res.data.maxAllowed
            });

            // Update selected job if it's the same
            if (selectedJob?._id === jobId) {
                setSelectedJob(prev => ({
                    ...prev,
                    isSaved: true,
                    userSavedCount: res.data.savedCount,
                    canSaveMore: res.data.savedCount < res.data.maxAllowed
                }));
            }

        } catch (err) {
            const message = err.response?.data?.message || "❌ Failed to save job.";
            toast.error(message);
            console.error("Save job error:", err);
        }
    };

    const handleUnsaveJob = async (jobId) => {
        try {
            const res = await axiosInstance.delete(`/company/save-job/${jobId}`);
            toast.success("✅ " + res.data.message);

            // Update the job in the list to reflect the unsaved status
            updateJobInList(jobId, { 
                isSaved: false,
                userSavedCount: res.data.savedCount,
                canSaveMore: true
            });

            // Update selected job if it's the same
            if (selectedJob?._id === jobId) {
                setSelectedJob(prev => ({
                    ...prev,
                    isSaved: false,
                    userSavedCount: res.data.savedCount,
                    canSaveMore: true
                }));
            }

        } catch (err) {
            const message = err.response?.data?.message || "❌ Failed to remove saved job.";
            toast.error(message);
            console.error("Unsave job error:", err);
        }
    };

    const debounceRef = useRef();

    // Manually debounce keyword
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setFilters((prev) => {
                if (prev.keyword !== searchInput) {
                    return { ...prev, keyword: searchInput };
                }
                return prev;
            });
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [searchInput]);

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4 bg-color-1 min-h-screen">
            {/* Header with gradient background */}
            {/* <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl"></div>
                <div className="relative p-6">
                    <h1 className="text-3xl font-bold text-color mb-2 bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent">
                        Job Board
                    </h1>
                    <p className="text-gray">Find your dream job or manage your applications</p>
                </div>
            </div> */}

            <TabHeader activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "find" && (
                <>
                    <div className="flex gap-2">
                        {/* Filter toggle */}
                        <div className="col-span-12 mb-2 hidden lg:block">
                            <button
                                onClick={() => setShowFilter((prev) => !prev)}
                                className="h-text-sm text-primary flex items-center gap-1 px-3 py-2 border border-primary rounded-sm hover:bg-primary-20 transition-all duration-200 font-medium"
                            >
                                {showFilter ? (
                                    <ChevronLeft className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                                <p className="text-nowrap">
                                    {showFilter ? "Hide Filters" : "Show Filters"}
                                </p>
                            </button>
                        </div>
                        <SearchBar value={searchInput} onChange={setSearchInput} />
                    </div>

                    {/* Main grid */}
                    <div className="grid grid-cols-12 gap-4">
                        {/* FILTER PANEL */}
                        <div
                            className={`col-span-12 ${
                                showFilter ? "lg:block" : "lg:hidden"
                            } lg:col-span-3`}
                        >
                            <FilterPanel filters={filters} onChange={setFilters} />
                        </div>

                        {/* JOB LIST */}
                        <div
                            className={`col-span-12 ${
                                selectedJob && !isNonDesktop
                                    ? showFilter
                                        ? "lg:col-span-5"
                                        : "lg:col-span-6"
                                    : showFilter
                                    ? "lg:col-span-9"
                                    : "lg:col-span-12"
                            }`}
                        >
                            <JobListPanel
                                jobs={jobs}
                                loading={loading}
                                activeTab={activeTab}
                                onSelectJob={setSelectedJob}
                                selectedJob={selectedJob}
                                isMobile={isNonDesktop}
                                onSave={handleSaveJob}
                                onUnsave={handleUnsaveJob}
                                onApply={handleApply}
                            />
                        </div>

                        {/* JOB DETAIL - Desktop Only */}
                        {isJobDetailVisible && (
                            <div
                                className={`hidden lg:block ${
                                    showFilter ? "lg:col-span-4" : "lg:col-span-6"
                                }`}
                            >
                                <JobDetailPanel 
                                    job={selectedJob} 
                                    onApply={handleApply}
                                    onSave={handleSaveJob}
                                    onUnsave={handleUnsaveJob}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === "saved" && (
                <>
                    <div className="grid grid-cols-12 gap-4">
                        {/* SAVED JOBS LIST */}
                        <div
                            className={`col-span-12 ${
                                selectedJob && !isNonDesktop
                                    ? "lg:col-span-8"
                                    : "lg:col-span-12"
                            }`}
                        >
                            <SavedJobs onSelectJob={setSelectedJob} />
                        </div>

                        {/* JOB DETAIL for Saved Jobs - Desktop Only */}
                        {isJobDetailVisible && (
                            <div className="hidden lg:block lg:col-span-4">
                                <JobDetailPanel 
                                    job={selectedJob} 
                                    onApply={handleApply}
                                    onSave={handleSaveJob}
                                    onUnsave={handleUnsaveJob}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === "pending" && <PendingJobs setActiveChatRoom={setActiveChatRoom} />}
            {activeTab === "accepted" && <AcceptedJobs setActiveChatRoom={setActiveChatRoom} />}
            {activeTab === "review" && <PendingReview />}
        </div>
    );
}