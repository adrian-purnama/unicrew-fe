import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/ApiHelper";
import ChatModal from "../../component/ChatModal";
import toast from "react-hot-toast";

export default function CompanyJobDetailPage() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [selected, setSelected] = useState([]);
    const [activeTab, setActiveTab] = useState("applied");
    const [activeChatRoom, setActiveChatRoom] = useState(null);

    useEffect(() => {
        if (!jobId) return;

        const fetchData = async () => {
            try {
                const [jobRes, appRes] = await Promise.all([
                    axiosInstance.get(`/company/job/${jobId}`),
                    axiosInstance.get(`/company/job/${jobId}/applicants`),
                ]);

                console.log(appRes.data);

                setJob(jobRes.data);
                setApplicants(appRes.data);
            } catch (err) {
                console.error("❌ Error loading job or applicants:", err);
            }
        };

        fetchData();
    }, [jobId]);

    const toggleSelect = (userId) => {
        setSelected((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const updateStatus = async (status, userIds = selected) => {
        if (!userIds || userIds.length === 0) return;

        try {
            await axiosInstance.patch(`/company/job/${jobId}/applicants/status`, {
                user: userIds,
                status,
            });

            setSelected([]);

            const refreshed = await axiosInstance.get(`/company/job/${jobId}/applicants`);
            setApplicants(refreshed.data);
        } catch (err) {
            console.error(`❌ Failed to update status "${status}":`, err);
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
    
    const renderSection = (users, phase) => (
        <div className="mt-4">
            {users.length === 0 ? (
                <p className="text-gray-500">No applicants.</p>
            ) : (
                users.map((app) => (
                    <div
                        key={app._id}
                        className="rounded-xl p-4 border border-gray-300 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                    {app.user.fullName}
                                </p>
                                <p className="text-sm text-gray-500">{app.user.email}</p>

                                {/* Match percent */}
                                {app.match && (
                                    <div
                                        className={`text-xs font-medium px-3 py-2 rounded-lg mt-1 space-y-1 ${
                                            app.match.percent >= 70
                                                ? "bg-green-100 text-green-800"
                                                : app.match.percent >= 40
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        <div>Match: {app.match.percent}%</div>
                                        {Array.isArray(app.match.reasons) &&
                                            app.match.reasons.length > 0 && (
                                                <ul className="list-disc list-inside space-y-0.5">
                                                    {app.match.reasons.map((reason, idx) => (
                                                        <li key={idx}>{reason}</li>
                                                    ))}
                                                </ul>
                                            )}
                                    </div>
                                )}

                                {/* Skills */}
                                {app.user.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {app.user.skills.map((skill) => (
                                            <span
                                                key={skill._id}
                                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* CV & Portfolio */}
                                <div className="flex flex-wrap gap-3 mt-3 text-sm">
                                    {app.user.curriculumVitae && (
                                        <a
                                            href={app.user.curriculumVitae}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full"
                                        >
                                            📄 View CV
                                        </a>
                                    )}
                                    {app.user.portfolio && (
                                        <a
                                            href={app.user.portfolio}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-full"
                                        >
                                            🎨 View Portfolio
                                        </a>
                                    )}
                                </div>

                                {/* Optional: Education */}
                                {app.user.university && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        🎓 {app.user.studyProgram?.name} at{" "}
                                        {app.user.university.name}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 capitalize mt-1">
                                    Status: {app.status}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                {phase === "applied" && (
                                    <>
                                        <button
                                            onClick={() =>
                                                updateStatus("shortListed", [app.user._id])
                                            }
                                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-xl hover:bg-blue-700"
                                        >
                                            Shortlist
                                        </button>
                                        <button
                                            onClick={() => updateStatus("rejected", [app.user._id])}
                                            className="bg-red-500 text-white text-sm px-3 py-1 rounded-xl hover:bg-red-600"
                                        >
                                            Reject
                                        </button>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(app.user._id)}
                                            onChange={() => toggleSelect(app.user._id)}
                                        />
                                    </>
                                )}
                                {(phase === "shortListed" || phase === "accepted") && (
                                    <>
                                        {phase === "shortListed" && (
                                            <button
                                                onClick={() =>
                                                    updateStatus("accepted", [app.user._id])
                                                }
                                                className="bg-green-600 text-white text-sm px-3 py-1 rounded-xl hover:bg-green-700"
                                            >
                                                Accept
                                            </button>
                                        )}
                                        <button
                                            onClick={() => updateStatus("rejected", [app.user._id])}
                                            className="bg-red-500 text-white text-sm px-3 py-1 rounded-xl hover:bg-red-600"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => openChatRoom(app.chatRoom)}
                                            className="bg-gray-700 text-white text-sm px-3 py-1 rounded-xl hover:bg-gray-800"
                                        >
                                            💬 Message
                                        </button>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(app.user._id)}
                                            onChange={() => toggleSelect(app.user._id)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const tabs = [
        { key: "applied", label: "Applied" },
        { key: "shortListed", label: "Shortlisted" },
        { key: "accepted", label: "Accepted" },
        { key: "rejected", label: "Rejected" },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto bg-color-1">
            {job && (
                <div className="mb-6 space-y-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {job.title}
                    </h1>

                    <p className="text-gray-600 dark:text-gray-300">{job.description}</p>

                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>
                            🧑‍💻 <strong>Work Type:</strong> {job.workType}
                        </p>

                        {job.location && (
                            <p>
                                📍 <strong>Location:</strong>{" "}
                                {[
                                    job.location.kecamatan?.name,
                                    job.location.kabupaten?.name,
                                    job.location.provinsi?.name,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        )}

                        {job.salaryRange && (
                            <p>
                                💰 <strong>Salary:</strong> {job.salaryRange.min?.toLocaleString()}{" "}
                                - {job.salaryRange.max?.toLocaleString()}{" "}
                                {job.salaryRange.currency || "IDR"}
                            </p>
                        )}
                    </div>

                    {job.requiredSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {job.requiredSkills.map((skill) => (
                                <span
                                    key={skill._id}
                                    className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded"
                                >
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 gap-6 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative pb-2 font-medium transition-all duration-300 ${
                            activeTab === tab.key ? "text-primary" : "text-gray-500"
                        }`}
                    >
                        {tab.label}
                        {grouped[tab.key]?.length > 0 && (
                            <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2">
                                {grouped[tab.key].length}
                            </span>
                        )}
                        {activeTab === tab.key && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-all duration-300"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {renderSection(grouped[activeTab], activeTab)}

            {selected.length > 0 && (
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => updateStatus("accepted")}
                        className="bg-green-700 text-white px-4 py-2 rounded-xl hover:bg-green-800"
                    >
                        Accept Selected
                    </button>
                    <button
                        onClick={() => updateStatus("rejected")}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
                    >
                        Reject Selected
                    </button>
                </div>
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
