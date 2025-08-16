import React, { useState } from "react";

const Spinner = ({ className = "w-4 h-4" }) => (
  <svg
    className={`animate-spin ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
  </svg>
);

export default function ApplicantCard({
  app,
  phase,
  selected,
  toggleSelect,
  updateStatus,   // async (status, [userId]) and MUST return a Promise
  openChatRoom,
  setEndTarget,
}) {
  // null | "shortListed" | "accepted" | "rejected"
  const [loadingAction, setLoadingAction] = useState(null);

  const buttonClass =
    "text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:shadow-md transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100";

  const getStatusBadgeColor = (status) => {
    const colors = {
      applied: "bg-primary-20 text-primary border-primary",
      shortListed: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Ensure spinner paints before awaiting network
  const act = async (status) => {
    try {
      setLoadingAction(status);
      // let React paint the state change first
      await new Promise((r) => requestAnimationFrame(r));
      // coerce to Promise in case parent didn't mark async
      await Promise.resolve(updateStatus(status, [app.user._id]));
    } finally {
      setLoadingAction(null);
    }
  };

  const isShortlisting = loadingAction === "shortListed";
  const isAccepting   = loadingAction === "accepted";
  const isRejecting   = loadingAction === "rejected";
  const anyLoading    = !!loadingAction;

  return (
    <div className="bg-color-2 rounded-xl p-6 border border-gray shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary transform hover:-translate-y-1">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-highlight rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {app.user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-color">{app.user.fullName}</h3>
              <p className="text-sm text-gray">{app.user.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(app.status)}`}>
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </span>
          </div>

          {/* Match Score */}
          {app.match && (
            <div
              className={`p-3 rounded-lg mb-3 ${
                app.match.percent >= 70
                  ? "bg-green-50 border border-green-200"
                  : app.match.percent >= 40
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    app.match.percent >= 70
                      ? "bg-green-500"
                      : app.match.percent >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
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
                  <span className="text-xs text-gray py-1">+{app.user.skills.length - 6} more</span>
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
          {phase === "applied" && (
            <>
              <button
                onClick={() => act("shortListed")}
                disabled={anyLoading}
                aria-busy={loadingAction === "shortListed"}
                className={`${buttonClass} btn-primary text-white flex items-center justify-center gap-2`}
              >
                {loadingAction === "shortListed" ? <Spinner /> : "✨ Shortlist"}
              </button>
              <button
                onClick={() => act("rejected")}
                disabled={anyLoading}
                aria-busy={loadingAction === "rejected"}
                className={`${buttonClass} bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2`}
              >
                {loadingAction === "rejected" ? <Spinner /> : "❌ Reject"}
              </button>
            </>
          )}

          {(phase === "shortListed" || phase === "accepted") && (
            <>
              {phase === "shortListed" && (
                <button
                  onClick={() => act("accepted")}
                  disabled={anyLoading}
                  aria-busy={loadingAction === "accepted"}
                  className={`${buttonClass} bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2`}
                >
                  {loadingAction === "accepted" ? <Spinner /> : "✅ Accept"}
                </button>
              )}
              <button
                onClick={() => act("rejected")}
                disabled={anyLoading}
                aria-busy={loadingAction === "rejected"}
                className={`${buttonClass} bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2`}
              >
                {loadingAction === "rejected" ? <Spinner /> : "❌ Reject"}
              </button>
              <button
                onClick={() => openChatRoom(app.chatRoom)}
                disabled={anyLoading}
                className={`${buttonClass} btn-highlight text-white`}
              >
                💬 Message
              </button>
              {phase === "accepted" && (
                <button
                  onClick={() => setEndTarget(app)}
                  disabled={anyLoading}
                  className={`${buttonClass} bg-orange-600 text-white hover:bg-orange-700`}
                  title="Mark this engagement as completed"
                >
                  🛑 End Job
                </button>
              )}
            </>
          )}

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(app.user._id)}
              onChange={() => toggleSelect(app.user._id)}
              className="sr-only"
              disabled={anyLoading}
            />
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all transform hover:scale-110 ${
                selected.includes(app.user._id)
                  ? "bg-primary border-primary text-white"
                  : "border-gray hover:border-primary"
              }`}
            >
              {selected.includes(app.user._id) && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
