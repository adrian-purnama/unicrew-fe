import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/ApiHelper";
import BaseModal from "./BaseModal";

export default function EditDescriptionsModal({ job, isOpen, onClose, onSuccess }) {
  const [descriptions, setDescriptions] = useState([{ title: "", content: "" }]);
  const [loading, setLoading] = useState(false);

  // Initialize descriptions when job data is available
  useEffect(() => {
    if (job && job.descriptions) {
      setDescriptions(
        job.descriptions.length > 0 
          ? job.descriptions 
          : [{ title: "", content: "" }]
      );
    }
  }, [job]);

  // Helper functions for managing descriptions
  const handleDescriptionChange = (index, field, value) => {
    const updated = [...descriptions];
    updated[index][field] = value;
    setDescriptions(updated);
  };

  const handleAddDescription = () => {
    setDescriptions([...descriptions, { title: "", content: "" }]);
  };

  const handleRemoveDescription = (index) => {
    if (descriptions.length === 1) return; // Keep at least one
    const updated = descriptions.filter((_, i) => i !== index);
    setDescriptions(updated);
  };

  // Validation function
  const validateDescriptions = () => {
    const errors = [];
    
    if (!descriptions || descriptions.length === 0) {
      errors.push("At least one description section is required");
      return errors;
    }
    
    descriptions.forEach((desc, index) => {
      if (!desc.title.trim()) {
        errors.push(`Description ${index + 1} title is required`);
      }
      if (!desc.content.trim()) {
        errors.push(`Description ${index + 1} content is required`);
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const errors = validateDescriptions();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.patch(`/job/job/${job._id}/descriptions`, {
        descriptions
      });
      toast.success("Job descriptions updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating job descriptions:", error);
      toast.error(error.response?.data?.message || "Failed to update job descriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Job Descriptions"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title Display */}
          <div className="bg-color-2 p-4 rounded-lg">
            <h3 className="font-semibold text-color mb-2">Job: {job?.title}</h3>
            <p className="text-sm text-gray-500">Edit the descriptions for this job posting</p>
          </div>

          {/* Descriptions */}
          <div>
            <h3 className="font-semibold text-color mb-3">Job Descriptions</h3>
            <p className="text-sm text-gray-500 mb-4">Add multiple description sections to provide comprehensive information about the job.</p>
            
            <div className="space-y-6">
              {descriptions.map((description, index) => (
                <div key={index} className="border border-gray p-4 rounded-lg bg-color-2 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-color">Description Section {index + 1}</h4>
                    {descriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDescription(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove Section
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-color mb-2">
                        Section Title *
                      </label>
                      <input
                        type="text"
                        value={description.title}
                        onChange={(e) => handleDescriptionChange(index, "title", e.target.value)}
                        placeholder="e.g., About This Role, Requirements, Benefits, Company Culture"
                        className="w-full border border-gray p-3 rounded-lg text-color bg-color-1 focus:outline-primary transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-color mb-2">
                        Section Content *
                      </label>
                      <textarea
                        value={description.content}
                        onChange={(e) => handleDescriptionChange(index, "content", e.target.value)}
                        placeholder="Provide detailed information for this section..."
                        className="w-full border border-gray p-3 rounded-lg text-color bg-color-1 focus:outline-primary transition-all resize-none"
                        rows={6}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddDescription}
                className="w-full border-2 border-dashed border-gray p-4 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">+</span>
                Add Another Description Section
              </button>
            </div>
          </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray rounded-lg text-color hover:bg-color-2 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              "Update Descriptions"
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
