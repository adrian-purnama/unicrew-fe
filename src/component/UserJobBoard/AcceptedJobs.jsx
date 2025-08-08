import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import BaseModal from "../../component/BaseModal";
import { MessageCircle, CheckCircle, Building, MapPin, Calendar, DollarSign } from "lucide-react";

export default function AcceptedJobs({ setActiveChatRoom }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchJobs = async () => {
        try {
            const res = await axiosInstance.get("/company/my-applications", {
                params: { status: "accepted" },
            });
            setJobs(res.data);
        } catch (err) {
            toast.error("Failed to fetch accepted jobs.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleEnd = async () => {
        if (!selectedApp) return;
        try {
            await axiosInstance.post("/company/application/end", {
                applicationId: selectedApp._id,
            });
            toast.success("Job ended successfully.");
            setJobs((prev) => prev.filter((j) => j._id !== selectedApp._id));
            setSelectedApp(null);
        } catch (err) {
            toast.error("Failed to end job.");
            console.error(err);
        }
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
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 opacity-30 mb-4" />
                <h3 className="text-lg font-semibold text-color mb-2">No Accepted Jobs</h3>
                <p className="text-gray">Your accepted job offers will appear here.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((item) => (
                    <div
                        key={item._id}
                        className="bg-color-2 border border-gray p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary group relative overflow-hidden"
                    >
                        {/* Success Badge */}
                        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-xs font-medium">
                            Accepted
                        </div>

                        {/* Job Info */}
                        <div className="mb-4 pt-2">
                            <h3 className="text-lg font-bold text-color mb-2 group-hover:text-primary transition-colors">
                                {item.job?.title || "Untitled Job"}
                            </h3>
                            
                            <div className="space-y-2 text-sm text-gray">
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-primary" />
                                    <span>{item.company?.name || "No company data"}</span>
                                </div>
                                
                                {item.job?.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>
                                            {item.job.location.kabupaten?.name}, {item.job.location.provinsi?.name}
                                        </span>
                                    </div>
                                )}
                                
                                {item.job?.salaryRange && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">
                                            {item.job.salaryRange.currency} {item.job.salaryRange.min?.toLocaleString()} - {item.job.salaryRange.max?.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                
                                {item.acceptedDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                        <span>Accepted on {new Date(item.acceptedDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray">
                            <button
                                onClick={() => {
                                    if (!item.chatRoom?._id) {
                                        toast.error("Chat not available.");
                                        return;
                                    }
                                    setActiveChatRoom(item.chatRoom._id);
                                }}
                                className="btn-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Message Employer
                            </button>

                            <button
                                onClick={() => setSelectedApp(item)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                            >
                                🔚 End Job
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Confirming End */}
            <BaseModal
                isOpen={!!selectedApp}
                onClose={() => setSelectedApp(null)}
                title="End this job?"
            >
                <div className="space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <p className="text-sm text-yellow-800">
                            <strong>⚠️ Warning:</strong> Are you sure you want to mark this job as ended? This action cannot be undone.
                        </p>
                    </div>
                    
                    {selectedApp && (
                        <div className="bg-color-1 rounded-lg p-4 border border-gray">
                            <h4 className="font-medium text-color mb-1">{selectedApp.job?.title}</h4>
                            <p className="text-sm text-gray">{selectedApp.company?.name}</p>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setSelectedApp(null)}
                            className="px-4 py-2 text-sm rounded-lg border border-gray hover:bg-color-1 text-color font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEnd}
                            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-md hover:shadow-lg"
                        >
                            Confirm End Job
                        </button>
                    </div>
                </div>
            </BaseModal>
        </>
    );
}