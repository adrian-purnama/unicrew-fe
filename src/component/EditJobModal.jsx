import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import SkillSelector from "./SkillSelector";
import LocationSelector from "./LocationSelector";
import Select from "react-select";
import axiosInstance from "../../utils/ApiHelper";

export default function EditJobModal({ job, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    workType: "onsite",
    location: { provinsi: "", kabupaten: "", kecamatan: "" },
    skills: [],
    minSalary: "",
    maxSalary: "",
    descriptions: [{ title: "", content: "" }],
  });

  const [loading, setLoading] = useState(false);

  // Work type options
  const workTypeOptions = [
    { value: "onsite", label: "🏢 Onsite" },
    { value: "remote", label: "🏠 Remote" },
    { value: "hybrid", label: "🔄 Hybrid" },
  ];

  // Initialize form when job data is available
  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || "",
        workType: job.workType || "onsite",
        location: job.location || { provinsi: "", kabupaten: "", kecamatan: "" },
        skills: job.requiredSkills?.map(skill => ({ value: skill._id, label: skill.name })) || [],
        minSalary: job.salaryRange?.min || "",
        maxSalary: job.salaryRange?.max || "",
        descriptions: job.descriptions?.length > 0 
          ? job.descriptions 
          : [{ title: "", content: "" }],
      });
    }
  }, [job]);

  // Helper functions for managing descriptions
  const handleDescriptionChange = (index, field, value) => {
    const updated = [...form.descriptions];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, descriptions: updated }));
  };

  const handleAddDescription = () => {
    setForm((prev) => ({
      ...prev,
      descriptions: [...prev.descriptions, { title: "", content: "" }],
    }));
  };

  const handleRemoveDescription = (index) => {
    if (form.descriptions.length === 1) return; // Keep at least one
    const updated = form.descriptions.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, descriptions: updated }));
  };

  // Validation functions
  const validateForm = () => {
    const errors = [];
    
    if (!form.title.trim()) {
      errors.push("Job title is required");
    }
    
    if (!form.workType) {
      errors.push("Work type is required");
    }
    
    if (form.workType !== "remote") {
      if (!form.location.provinsi) {
        errors.push("Provinsi is required for onsite/hybrid jobs");
      }
      if (!form.location.kabupaten) {
        errors.push("Kabupaten is required for onsite/hybrid jobs");
      }
      if (!form.location.kecamatan) {
        errors.push("Kecamatan is required for onsite/hybrid jobs");
      }
    }
    
    if (!form.skills || form.skills.length === 0) {
      errors.push("At least one skill is required");
    }
    
    if (form.minSalary && form.maxSalary && form.minSalary > form.maxSalary) {
      errors.push("Minimum salary cannot be greater than maximum salary");
    }
    
    if (!form.descriptions || form.descriptions.length === 0) {
      errors.push("At least one description section is required");
    } else {
      form.descriptions.forEach((desc, index) => {
        if (!desc.title.trim()) {
          errors.push(`Description ${index + 1} title is required`);
        }
        if (!desc.content.trim()) {
          errors.push(`Description ${index + 1} content is required`);
        }
      });
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      workType: form.workType,
      location: form.workType !== "remote" ? form.location : undefined,
      requiredSkills: form.skills.map((s) => s.value),
      salaryMin: form.minSalary,
      salaryMax: form.maxSalary,
      descriptions: form.descriptions,
    };

    try {
      await axiosInstance.put(`/job/job/${job._id}`, payload);
      toast.success("Job updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error(error.response?.data?.message || "Failed to update job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Toaster position="top-center" />
      <div className="bg-color-1 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-color">Edit Job Posting</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-color mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter job title"
              className="w-full border border-gray p-3 rounded-lg text-color bg-color-2 focus:outline-primary transition-all"
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="block text-sm font-medium text-color mb-2">
              Work Type *
            </label>
            <Select
              value={workTypeOptions.find(option => option.value === form.workType)}
              onChange={(selectedOption) =>
                setForm((prev) => ({ ...prev, workType: selectedOption.value }))
              }
              options={workTypeOptions}
              className="text-color"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "var(--color-2)",
                  borderColor: "var(--color-gray)",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? "var(--color-primary)" : "white",
                  color: state.isSelected ? "white" : "var(--color-text)",
                }),
              }}
            />
          </div>

          {/* Location */}
          {form.workType !== "remote" && (
            <div>
              <label className="block text-sm font-medium text-color mb-2">
                Location *
              </label>
              <LocationSelector
                value={form.location}
                onChange={(location) => setForm((prev) => ({ ...prev, location }))}
              />
            </div>
          )}

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-color mb-2">
              Required Skills *
            </label>
            <SkillSelector
              value={form.skills}
              onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
            />
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-color mb-2">
                Minimum Salary
              </label>
              <input
                type="number"
                value={form.minSalary}
                onChange={(e) => setForm((prev) => ({ ...prev, minSalary: e.target.value }))}
                placeholder="e.g., 5000000"
                className="w-full border border-gray p-3 rounded-lg text-color bg-color-2 focus:outline-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color mb-2">
                Maximum Salary
              </label>
              <input
                type="number"
                value={form.maxSalary}
                onChange={(e) => setForm((prev) => ({ ...prev, maxSalary: e.target.value }))}
                placeholder="e.g., 10000000"
                className="w-full border border-gray p-3 rounded-lg text-color bg-color-2 focus:outline-primary transition-all"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <h3 className="font-semibold text-color mb-3">Job Descriptions</h3>
            <p className="text-sm text-gray-500 mb-4">Add multiple description sections to provide comprehensive information about the job.</p>
            
            <div className="space-y-6">
              {form.descriptions.map((description, index) => (
                <div key={index} className="border border-gray p-4 rounded-lg bg-color-2 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-color">Description Section {index + 1}</h4>
                    {form.descriptions.length > 1 && (
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
                        className="w-full border border-gray p-3 rounded-lg text-color bg-color-2 focus:outline-primary transition-all"
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
                        className="w-full border border-gray p-3 rounded-lg text-color bg-color-2 focus:outline-primary transition-all resize-none"
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
                "Update Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
