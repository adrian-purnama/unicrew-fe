import { useState, useCallback } from "react";
import axiosInstance from "../../../utils/ApiHelper";

export default function useJobData() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchJobs = useCallback(async (activeTab, filters = {}) => {
        if (activeTab !== "find") return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            // Add filters to params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    if (key === "location" && typeof value === "object") {
                        // Handle nested location object
                        Object.entries(value).forEach(([locKey, locValue]) => {
                            if (locValue) {
                                params.append(`location[${locKey}]`, locValue);
                            }
                        });
                    } else if (Array.isArray(value)) {
                        // Handle arrays (skills, workType, etc.)
                        value.forEach(item => {
                            params.append(key, item);
                        });
                    } else {
                        params.append(key, value);
                    }
                }
            });

            const response = await axiosInstance.get(`/company/job-feed?${params.toString()}`);
            console.log(response)
            setJobs(response.data.jobs || []);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError(err);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateJobInList = useCallback((jobId, updates) => {
        setJobs(prevJobs => 
            prevJobs.map(job => 
                job._id === jobId 
                    ? { ...job, ...updates }
                    : job
            )
        );
    }, []);

    const removeJobFromList = useCallback((jobId) => {
        setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    }, []);

    const addJobToList = useCallback((newJob) => {
        setJobs(prevJobs => [newJob, ...prevJobs]);
    }, []);

    const markJobAsApplied = useCallback((jobId) => {
        updateJobInList(jobId, { hasApplied: true });
    }, [updateJobInList]);

    const markJobAsSaved = useCallback((jobId, savedData) => {
        updateJobInList(jobId, { 
            isSaved: true,
            userSavedCount: savedData.savedCount,
            canSaveMore: savedData.savedCount < savedData.maxAllowed
        });
    }, [updateJobInList]);

    const markJobAsUnsaved = useCallback((jobId, savedData) => {
        updateJobInList(jobId, { 
            isSaved: false,
            userSavedCount: savedData.savedCount,
            canSaveMore: true
        });
    }, [updateJobInList]);

    return {
        jobs,
        loading,
        error,
        fetchJobs,
        updateJobInList,
        removeJobFromList,
        addJobToList,
        markJobAsApplied,
        markJobAsSaved,
        markJobAsUnsaved
    };
}