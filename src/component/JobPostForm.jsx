import { useEffect, useState } from "react";
import SkillSelector from "./SkillSelector";
import axiosInstance from "../../utils/ApiHelper";
import LocationSelector from "./LocationSelector";

export default function JobPostForm({ onSuccess }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: "",
        workType: "onsite",
        location: { provinsi: "", kabupaten: "", kecamatan: "" },
        skills: [],
        minSalary: "",
        maxSalary: "",
        additionalInfoSections: [{ header: "", info: "" }],
    });

    const [locationOptions, setLocationOptions] = useState({
        provinsi: [],
        kabupaten: [],
        kecamatan: [],
    });

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

    const handleAddSection = () => {
        setForm((prev) => ({
            ...prev,
            additionalInfoSections: [...prev.additionalInfoSections, { header: "", info: "" }],
        }));
    };

    const handleSectionChange = (index, key, value) => {
        const updated = [...form.additionalInfoSections];
        updated[index][key] = value;
        setForm((prev) => ({ ...prev, additionalInfoSections: updated }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const compiledInfo = form.additionalInfoSections
            .filter((sec) => sec.header || sec.info)
            .map((sec) => `${sec.header}\n${sec.info}`)
            .join("\n\n");

        const payload = {
            title: form.title,
            description: compiledInfo,
            workType: form.workType,
            location: form.workType !== "remote" ? form.location : undefined,
            requiredSkills: form.skills.map((s) => s.value),
            salaryMin: form.minSalary,
            salaryMax: form.maxSalary,
        };

        await axiosInstance.post("/company/job", payload);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step indicators */}
            {/* Step progress bar */}
            <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((s, index) => (
                    <div key={s} className="flex-1 flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                step === s
                                    ? "bg-primary text-white"
                                    : step > s
                                    ? "bg-primary-100 text-primary"
                                    : "bg-gray-200 text-gray-500"
                            }`}
                        >
                            {s}
                        </div>

                        {index < 2 && (
                            <div className="flex-1 h-1 mx-2 bg-gray-300 relative">
                                <div
                                    className={`absolute h-full left-0 top-0 transition-all duration-300 ${
                                        step > s ? "w-full bg-primary" : "w-0"
                                    }`}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <>
                    <div>
                        <label className="font-semibold block">Job Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="font-semibold block">Work Type</label>
                        <select
                            name="workType"
                            value={form.workType}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="onsite">Onsite</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>

                    {form.workType !== "remote" && (
                        <div className="space-y-4">
                            <label className="font-semibold block">Location</label>
                            <LocationSelector
                                value={form.location}
                                onChange={(newLocation) =>
                                    setForm((prev) => ({ ...prev, location: newLocation }))
                                }
                            />
                        </div>
                    )}
                </>
            )}

            {/* Step 2: Skills and Salary */}
            {step === 2 && (
                <>
                    <SkillSelector
                        value={form.skills}
                        onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
                    />
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="font-semibold block">Min Salary</label>
                            <input
                                name="minSalary"
                                type="number"
                                value={form.minSalary}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="font-semibold block">Max Salary</label>
                            <input
                                name="maxSalary"
                                type="number"
                                value={form.maxSalary}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Step 3: Additional Info */}
            {step === 3 && (
                <div className="space-y-4">
                    {form.additionalInfoSections.map((section, idx) => (
                        <div key={idx} className="space-y-2">
                            <input
                                type="text"
                                value={section.header}
                                onChange={(e) => handleSectionChange(idx, "header", e.target.value)}
                                placeholder="Section Header"
                                className="w-full border p-2 rounded font-semibold"
                            />
                            <textarea
                                value={section.info}
                                onChange={(e) => handleSectionChange(idx, "info", e.target.value)}
                                placeholder="Section Details"
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddSection}
                        className="text-sm text-primary underline"
                    >
                        + Add Section
                    </button>
                </div>
            )}

            {/* Step navigation */}
            <div className="flex justify-between pt-4">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={() => setStep((s) => s - 1)}
                        className="px-4 py-2 border rounded"
                    >
                        Back
                    </button>
                ) : (
                    <div />
                )}

                {step < 3 ? (
                    <button
                        type="button"
                        onClick={() => setStep((s) => s + 1)}
                        className="btn-primary px-4 py-2"
                    >
                        Next
                    </button>
                ) : (
                    <button type="submit" className="btn-primary px-4 py-2">
                        Post Job
                    </button>
                )}
            </div>
        </form>
    );
}
