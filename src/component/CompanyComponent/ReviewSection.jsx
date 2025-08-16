import React from "react";

export default function ReviewSection({ pendingReviews, onOpen }) {
  if (!pendingReviews || pendingReviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-bounce">⭐</div>
        <p className="text-gray text-lg">No pending reviews</p>
        <p className="text-gray text-sm">Reviews will appear here for completed applications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingReviews.map((app) => (
        <div key={app._id} className="bg-color-2 rounded-xl p-6 border border-gray shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {app.user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-color">{app.user.fullName}</h3>
                <p className="text-sm text-gray">{app.user.email}</p>
                <p className="text-xs text-gray mt-1">Application completed • Awaiting review</p>
              </div>
            </div>
            <button onClick={() => onOpen(app)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 transform hover:scale-105 shadow-md hover:shadow-lg">
              ⭐ Leave Review
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}