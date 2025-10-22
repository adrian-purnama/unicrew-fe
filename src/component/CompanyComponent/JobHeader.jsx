import React from "react";

export default function JobHeader({ job, onBack }) {
  if (!job) return null;
  return (
    <div className="bg-color-2 rounded-xl p-6 mb-6 shadow-sm border border-gray relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-highlight"></div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-color mb-2">{job.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray">
            <span className="flex items-center gap-1 text-primary">🧑‍💻 {job.workType}</span>
            {job.location && (
              <span className="flex items-center gap-1">
                📍 {[job.location.kecamatan?.name, job.location.kabupaten?.name, job.location.provinsi?.name]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
            {job.salaryRange && (
              <span className="flex items-center gap-1 text-green-600">
                💰 {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()} {job.salaryRange.currency || "IDR"}
              </span>
            )}
          </div>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-color-1 hover:bg-primary-20 text-color border border-gray hover:border-primary px-4 py-2 rounded-lg transition-all duration-200"
          >
            ← Back
          </button>
        )}
      </div>
      {job.descriptions && job.descriptions.length > 0 && (
        <div className="mb-4">
          {job.descriptions.map((description, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold text-color mb-2">{description.title}</h3>
              <p className="text-color leading-relaxed whitespace-pre-wrap">{description.content}</p>
            </div>
          ))}
        </div>
      )}

      {job.requiredSkills?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <span key={skill._id} className="bg-primary-20 text-primary text-sm font-medium px-3 py-1 rounded-full border border-primary">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}