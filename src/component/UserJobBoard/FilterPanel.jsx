import { useState, useEffect } from "react";
import { Menu, X, Filter, ChevronDown } from "lucide-react";
import SkillSelector from "../SkillSelector";
import IndustrySelector from "../IndustrySelector";
import LocationSelector from "../LocationSelector";

export default function FilterPanel({ filters = {}, onChange }) {
    const defaultFilters = {
        workType: [],
        skills: [],
        industries: [],
        location: {
            provinsi: "",
            kabupaten: "",
            kecamatan: "",
        },
        minSalary: "",
    };

    const mergedFilters = {
        ...defaultFilters,
        ...filters,
        location: {
            ...defaultFilters.location,
            ...(filters.location || {}),
        },
    };

    const [localFilters, setLocalFilters] = useState(mergedFilters);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleInput = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("location.")) {
            const key = name.split(".")[1];
            setLocalFilters((prev) => ({
                ...prev,
                location: {
                    ...prev.location,
                    [key]: value,
                    ...(key === "provinsi" ? { kabupaten: "", kecamatan: "" } : {}),
                    ...(key === "kabupaten" ? { kecamatan: "" } : {}),
                },
            }));
        } else {
            setLocalFilters((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleWorkType = (type) => {
        setLocalFilters((prev) => ({
            ...prev,
            workType: prev.workType.includes(type)
                ? prev.workType.filter((t) => t !== type)
                : [...prev.workType, type],
        }));
    };

    const handleSubmit = () => {
        const out = {
            ...localFilters,
            skills: localFilters.skills, // 👈 Save as full objects
            industries: localFilters.industries,
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(out));
        onChange({
            ...out,
            skills: out.skills.map((s) => s.value),
            industries: out.industries.map((i) => i.value),
        });

        setIsMobileOpen(false);
    };

    const handleClear = () => {
        setLocalFilters(defaultFilters);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // ✅ Clear persisted filters
        onChange({});
        setIsMobileOpen(false);
    };

    const LOCAL_STORAGE_KEY = "unicru-job-filters";

    useEffect(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setLocalFilters((prev) => ({
                    ...prev,
                    ...parsed,
                    location: {
                        ...prev.location,
                        ...(parsed.location || {}),
                    },
                }));
            } catch (err) {
                console.warn("❌ Failed to parse saved filters:", err);
            }
        }
    }, []);

    const activeFilterCount = 
        localFilters.workType.length + 
        localFilters.skills.length + 
        localFilters.industries.length + 
        (localFilters.location.provinsi ? 1 : 0) +
        (localFilters.minSalary ? 1 : 0);

    const content = (
        <div className="space-y-5 text-color">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-color flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Filter Jobs
                </h2>
                {activeFilterCount > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                        {activeFilterCount} active
                    </span>
                )}
            </div>

            {/* Work Type */}
            <div className="bg-color-1 rounded-lg p-4 border border-gray">
                <label className="font-semibold block mb-3 text-color flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Work Type
                </label>
                <div className="space-y-2">
                    {["onsite", "remote", "hybrid"].map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={localFilters.workType.includes(type)}
                                onChange={() => handleWorkType(type)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                localFilters.workType.includes(type)
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-gray group-hover:border-primary'
                            }`}>
                                {localFilters.workType.includes(type) && (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="capitalize text-sm group-hover:text-primary transition-colors">
                                {type}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div className="bg-color-1 rounded-lg p-4 border border-gray">
                <label className="font-semibold block mb-3 text-color flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Location
                </label>
                <LocationSelector
                    value={localFilters.location}
                    onChange={(location) => setLocalFilters((prev) => ({ ...prev, location }))}
                />
            </div>

            {/* Skills */}
            <div className="bg-color-1 rounded-lg p-4 border border-gray">
                <label className="font-semibold block mb-3 text-color flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Skills
                </label>
                <SkillSelector
                    value={localFilters.skills}
                    onChange={(skills) => setLocalFilters((prev) => ({ ...prev, skills }))}
                />
            </div>

            {/* Industries */}
            <div className="bg-color-1 rounded-lg p-4 border border-gray">
                <label className="font-semibold block mb-3 text-color flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Industries
                </label>
                <IndustrySelector
                    value={localFilters.industries}
                    onChange={(industries) => setLocalFilters((prev) => ({ ...prev, industries }))}
                />
            </div>

            {/* Minimum Salary */}
            <div className="bg-color-1 rounded-lg p-4 border border-gray">
                <label className="font-semibold block mb-3 text-color flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    Minimum Salary
                </label>
                <input
                    type="number"
                    name="minSalary"
                    value={localFilters.minSalary}
                    onChange={handleInput}
                    className="w-full border border-gray p-3 rounded-lg bg-color-2 text-color focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="e.g. 5000000"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 sticky bottom-[-20px] bg-color-2 -mx-4 px-4 pb-4 bg-color-2">
                <button
                    onClick={handleSubmit}
                    className="btn-primary text-white font-bold px-4 py-2.5 rounded-lg flex-1 shadow-md hover:shadow-lg transition-all"
                >
                    Apply Filters
                </button>
                <button
                    onClick={handleClear}
                    className="bg-color-1 text-gray border border-gray px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                    Clear
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile: Button to open drawer */}
            <div className="lg:hidden mb-2">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="text-primary text-sm font-semibold flex items-center gap-2 px-4 py-2 border border-primary rounded-lg hover:bg-primary-20 transition-all"
                >
                    <Menu className="w-4 h-4" /> 
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Desktop panel */}
            <div className="hidden lg:block bg-color-2 border-gray border rounded-lg p-5 shadow-sm max-h-[70vh] overflow-y-scroll sleek-scrollbar">
                {content}
            </div>

            {/* Mobile slide-in drawer */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex justify-end lg:hidden">
                    <div className="w-full max-w-sm bg-color-2 h-full p-6 pb-0 overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg text-color">Filters</h2>
                            <button 
                                onClick={() => setIsMobileOpen(false)}
                                className="p-2 hover:bg-color-1 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {content}
                    </div>
                </div>
            )}
        </>
    );
}