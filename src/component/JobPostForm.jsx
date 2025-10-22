import { useState } from "react";
import SkillSelector from "./SkillSelector";
import axiosInstance from "../../utils/ApiHelper";
import LocationSelector from "./LocationSelector";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";

export default function JobPostForm({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    workType: "onsite",
    location: { provinsi: "", kabupaten: "", kecamatan: "" },
    skills: [],
    minSalary: "",
    maxSalary: "",
    descriptions: [{ title: "", content: "" }],
  });

  // Work type options for custom dropdown
  const workTypeOptions = [
    { value: "onsite", label: "🏢 Onsite" },
    { value: "remote", label: "🏠 Remote" },
    { value: "hybrid", label: "🔄 Hybrid" },
  ];

  // Validation functions
  const validateStep1 = () => {
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
    
    return errors;
  };

  const validateStep2 = () => {
    const errors = [];
    
    if (!form.skills || form.skills.length === 0) {
      errors.push("At least one skill is required");
    }
    
    // Validate salary range if both are provided
    if (form.minSalary && form.maxSalary && form.minSalary > form.maxSalary) {
      errors.push("Minimum salary cannot be greater than maximum salary");
    }
    
    return errors;
  };

  const validateStep3 = () => {
    const errors = [];
    
    if (!form.descriptions || form.descriptions.length === 0) {
      errors.push("At least one description section is required");
      return errors;
    }
    
    form.descriptions.forEach((desc, index) => {
      if (!desc.title.trim()) {
        errors.push(`Description ${index + 1} title is required`);
      }
      if (!desc.content.trim()) {
        errors.push(`Description ${index + 1} content is required`);
      }
    });
    
    return errors;
  };

  const validateForm = () => {
    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    const step3Errors = validateStep3();
    
    return {
      isValid: step1Errors.length === 0 && step2Errors.length === 0 && step3Errors.length === 0,
      errors: [...step1Errors, ...step2Errors, ...step3Errors]
    };
  };


  const formatID = (n) =>
    n === '' || n === null || n === undefined
      ? ''
      : new Intl.NumberFormat('id-ID').format(Number(n)); // 200000 -> 200.000

  const parseDigits = (s) => {
    const digits = String(s).replace(/\D/g, ''); // strip non-digits
    return digits === '' ? '' : Number(digits);
  };

  // use this for salary fields only
  const handleMoneyChange = (field) => (e) => {
    const raw = e.target.value;
    const parsed = parseDigits(raw);
    setForm((prev) => ({ ...prev, [field]: parsed }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate entire form before submission
    const validation = validateForm();
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
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
      await axiosInstance.post("/job/job", payload);
      toast.success("Job posted successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error(error.response?.data?.message || "Failed to post job. Please try again.");
    }
  };

  return (
    <div>
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3].map((s, index) => (
          <div key={s} className="flex-1 flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === s
                  ? "bg-primary text-white shadow-lg"
                  : step > s
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
            >
              {step > s ? "✓" : s}
            </div>

            {index < 2 && (
              <div className="flex-1 h-1 mx-2 bg-gray-300 relative rounded-full">
                <div
                  className={`absolute h-full left-0 top-0 transition-all duration-500 rounded-full ${step > s ? "w-full bg-green-500" : "w-0 bg-primary"
                    }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Step labels */}
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span className="text-center flex-1">Basic Info</span>
        <span className="text-center flex-1">Skills & Salary</span>
        <span className="text-center flex-1">Job Details</span>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="font-semibold block text-color mb-2">Job Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full border border-gray text-color bg-color-2 p-3 rounded-lg focus:outline-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="font-semibold block text-color mb-2">Work Type *</label>
            <Select
              options={workTypeOptions}
              value={workTypeOptions.find(option => option.value === form.workType)}
              onChange={(selectedOption) => {
                setForm((prev) => ({ ...prev, workType: selectedOption.value }));
              }}
              placeholder="Select work type..."
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "var(--tw-bg-color-2, #f9fafb)",
                  borderColor: "#d1d5db",
                  borderRadius: "0.5rem",
                  padding: "0.25rem 0.5rem",
                  minHeight: "48px",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "#4f46e5",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 999,
                }),
              }}
            />
          </div>

          {form.workType !== "remote" && (
            <div>
              <label className="font-semibold block text-color mb-2">Location *</label>
              <LocationSelector
                value={form.location}
                onChange={(newLocation) =>
                  setForm((prev) => ({ ...prev, location: newLocation }))
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Skills and Salary */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="font-semibold block text-color mb-2">Required Skills *</label>
            <SkillSelector
              value={form.skills}
              onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
            />
            <p className="text-sm text-gray-500 mt-2">Select the key skills required for this position</p>
          </div>
          
          <div>
            <label className="font-semibold block text-color mb-3">Salary Range (IDR)</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-500 block mb-1">Minimum Salary</label>
                <input
                  name="minSalary"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatID(form.minSalary)}
                  onChange={handleMoneyChange('minSalary')}
                  className="w-full border border-gray p-3 rounded-lg text-right text-color bg-color-2 focus:outline-primary transition-all"
                  placeholder="2.000.000"
                />
              </div>

              <div className="flex-1">
                <label className="text-sm text-gray-500 block mb-1">Maximum Salary</label>
                <input
                  name="maxSalary"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatID(form.maxSalary)}
                  onChange={handleMoneyChange('maxSalary')}
                  className="w-full border border-gray p-3 rounded-lg text-right text-color bg-color-2 focus:outline-primary transition-all"
                  placeholder="5.000.000"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Leave empty if salary is negotiable</p>
          </div>
        </div>
      )}

      {/* Step 3: Additional Info */}
      {step === 3 && (
        <div className="space-y-6">
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
        </div>
      )}

      {/* Step navigation */}
      <div className="flex justify-between pt-4 border-t border-gray">
        {step > 1 ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setStep((s) => s - 1);
            }}
            className="px-4 py-2 border border-gray rounded-lg text-color hover:bg-color-1 transition-all font-medium"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Validate current step before proceeding
              if (step === 1) {
                const errors = validateStep1();
                if (errors.length > 0) {
                  errors.forEach(error => toast.error(error));
                  return;
                }
              } else if (step === 2) {
                const errors = validateStep2();
                if (errors.length > 0) {
                  errors.forEach(error => toast.error(error));
                  return;
                }
              } else if (step === 3) {
                const errors = validateStep3();
                if (errors.length > 0) {
                  errors.forEach(error => toast.error(error));
                  return;
                }
              }
              setStep((s) => s + 1);
            }}
            className="btn-primary px-4 py-2 rounded-lg transition-all font-medium"
          >
            Next →
          </button>
        ) : (
          <button 
            type="submit" 
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center gap-2"
          >
            <span>🚀</span>
            Post Job
          </button>
        )}
      </div>
    </form>
    </div>
  );
}
