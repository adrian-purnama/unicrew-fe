import React from "react";

export default function LoadingSkeleton({ lines = 3, height = 48 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl" style={{ height }}></div>
        </div>
      ))}
    </div>
  );
}
