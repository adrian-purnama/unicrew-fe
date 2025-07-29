import { useEffect, useState } from "react";
import Navigation from "../../component/Navigation";
import BaseModal from "../../component/BaseModal";
import JobPostForm from "../../component/JobPostForm";
import JobCard from "../../component/JobCard"; // ✅ Import the component
import axiosInstance from "../../../utils/ApiHelper";

export default function CompanyHomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobPosts, setJobPosts] = useState([]);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get("/company/job-postings");
      setJobPosts(res.data);
      console.log(res.data)
    } catch (err) {
      console.error("Failed to load job postings:", err.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePostSuccess = () => {
    setIsModalOpen(false);
    fetchJobs();
  };

  const handleDelete = (id) => {
    setJobPosts((prev) => prev.filter((job) => job._id !== id));
  };

  return (
    <div className="bg-color-1">
      <Navigation />
      <div className="p-6 max-w-4xl mx-auto bg-color-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-color">Your Job Postings</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-4 py-2 rounded text-white font-bold"
          >
            + Post Job
          </button>
        </div>

        {jobPosts.length === 0 ? (
          <p>No job postings yet.</p>
        ) : (
          <div className="space-y-4">
            {jobPosts.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                mode = "company"
                onDelete={handleDelete}
                onStatusChange={fetchJobs}
              />
            ))}
          </div>
        )}
      </div>

      <BaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post a New Job"
      >
        <JobPostForm onSuccess={handlePostSuccess} />
      </BaseModal>
    </div>
  );
}
