import React from "react";

export default function EndJobConfirm({ endTarget, ending, onCancel, onConfirm, jobTitle }) {
  if (!endTarget) return null;
  return (
    <div className="space-y-6">
      <div className="p-4 bg-primary-20 rounded-lg border border-primary">
        <div className="font-semibold">{endTarget?.user?.fullName}</div>
        <div className="text-sm text-gray">{jobTitle}</div>
      </div>
      <p className="text-sm text-gray">
        Are you sure you want to mark this application as <span className="font-semibold">ended</span>? This should be used once the work is completed.
      </p>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={ending} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all disabled:opacity-60">Cancel</button>
        <button type="button" onClick={onConfirm} disabled={ending} className="px-4 py-2 rounded-lg bg-orange-600 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-60">{ending ? "Ending…" : "Confirm End"}</button>
      </div>
    </div>
  );
}
