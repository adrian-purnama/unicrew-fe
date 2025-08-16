import React from "react";
import JobCard from "../../component/JobCard"; // keep your existing component
import LoadingSkeleton from "../common/LoadingSkeleton";

export default function JobsList({ jobs, loading, onDelete, onStatusChange, allCount, searchTerm, filterStatus }) {
  return (
    <div className="bg-color-2 rounded-xl shadow-sm border border-gray overflow-hidden">
      <div className="p-6 border-b border-gray bg-gradient-to-r from-primary/5 to-transparent">
        <h2 className="text-xl font-semibold text-color">Your Job Postings</h2>
      </div>

      <div className="p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            {allCount === 0 ? (
              <div>
                <div className="text-6xl mb-4 animate-bounce">💼</div>
                <h3 className="text-xl font-semibold text-color mb-2">No job postings yet</h3>
                <p className="text-gray mb-6">Start by creating your first job posting to attract talented candidates</p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-color mb-2">No jobs match your filters</h3>
                <p className="text-gray mb-4">Try adjusting your search terms or filters</p>
                {searchTerm || filterStatus !== "all" ? (
                  <span className="text-xs text-gray">Filters applied</span>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, index) => (
              <div
                key={job._id}
                className="transition-all duration-300 rounded-xl transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <JobCard job={job} mode="company" onDelete={onDelete} onStatusChange={onStatusChange} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}