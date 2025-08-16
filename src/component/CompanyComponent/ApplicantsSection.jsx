import React, { useMemo } from "react";
import ApplicantCard from "./ApplicantCard";
import LoadingSkeleton from "../common/LoadingSkeleton";

export default function ApplicantsSection({
  users,
  phase,
  loading,
  selected,
  toggleSelectAll,
  toggleSelect,
  updateStatus,   // must return a Promise
  openChatRoom,
  setEndTarget,
}) {
  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        <LoadingSkeleton lines={3} height={128} />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">📭</div>
        <p className="text-gray text-lg">No applicants in this stage</p>
        <p className="text-gray text-sm">
          Applicants will appear here when they apply or get moved to this stage
        </p>
      </div>
    );
  }

  const allUserIds = useMemo(() => users.map(u => u.user._id), [users]);
  const allSelected = selected.length === allUserIds.length && allUserIds.length > 0;

  return (
    <div className="mt-4">
      <div className="bg-primary-20 p-4 rounded-lg mb-4 border border-primary">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleSelectAll(allUserIds)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all transform hover:scale-110 ${
                allSelected
                  ? "bg-primary border-primary text-white"
                  : "border-primary hover:bg-primary-20"
              }`}
            >
              {allSelected && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
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

      <div className="space-y-4">
        {users.map((app) => (
          <ApplicantCard
            key={app._id}
            app={app}
            phase={phase}
            selected={selected}
            toggleSelect={toggleSelect}
            updateStatus={updateStatus}  // child handles loading
            openChatRoom={openChatRoom}
            setEndTarget={setEndTarget}
          />
        ))}
      </div>
    </div>
  );
}
