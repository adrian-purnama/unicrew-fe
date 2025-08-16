import React from "react";

export default function BulkActionsBar({ visible, activeTab, selectedCount, onShortlist, onAccept, onReject, onClear }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-color-2 rounded-xl shadow-2xl border border-primary p-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-primary">{selectedCount} applicant(s) selected</span>
        <div className="flex gap-2">
          {activeTab === "applied" && (
            <button onClick={onShortlist} className="btn-primary text-white text-sm font-medium transition-all duration-200">Shortlist Selected</button>
          )}
          {(activeTab === "applied" || activeTab === "shortListed") && (
            <button onClick={onAccept} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">Accept Selected</button>
          )}
          <button onClick={onReject} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">Reject Selected</button>
          <button onClick={onClear} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">Clear</button>
        </div>
      </div>
    </div>
  );
}
