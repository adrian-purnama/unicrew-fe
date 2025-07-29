import { useEffect, useState } from "react";
import SkillSelector from "./SkillSelector";
import axiosInstance from "../../utils/ApiHelper";
import { Menu } from "lucide-react";
import IndustrySelector from "./IndustrySelector";

export default function FilterPanel({ filters, onChange }) {
    const defaultFilters = {
        workType: [],
        location: {
            provinsi: "",
            kabupaten: "",
            kecamatan: "",
        },
        skills: [],
        industries: [], // ← Add this line
    };

    const [localFilters, setLocalFilters] = useState(() => {
        const saved = localStorage.getItem("unicru-user-filters");
        return saved ? { ...defaultFilters, ...JSON.parse(saved) } : defaultFilters;
    });

    const [locationOptions, setLocationOptions] = useState({
        provinsi: [],
        kabupaten: [],
        kecamatan: [],
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        axiosInstance.get("/admin/provinsi").then((res) => {
            setLocationOptions((prev) => ({ ...prev, provinsi: res.data }));
        });
    }, []);

    useEffect(() => {
        const provId = localFilters.location.provinsi;
        if (provId) {
            axiosInstance.get(`/admin/kabupaten?provinsi=${provId}`).then((res) => {
                setLocationOptions((prev) => ({
                    ...prev,
                    kabupaten: res.data,
                    kecamatan: [],
                }));
            });
        } else {
            setLocationOptions((prev) => ({ ...prev, kabupaten: [], kecamatan: [] }));
        }
    }, [localFilters.location.provinsi]);

    useEffect(() => {
        const kabId = localFilters.location.kabupaten;
        if (kabId) {
            axiosInstance.get(`/admin/kecamatan?kabupaten=${kabId}`).then((res) => {
                setLocationOptions((prev) => ({
                    ...prev,
                    kecamatan: res.data,
                }));
            });
        } else {
            setLocationOptions((prev) => ({ ...prev, kecamatan: [] }));
        }
    }, [localFilters.location.kabupaten]);

    const handleChange = (e) => {
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
            setLocalFilters((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSkillChange = (skills) => {
        setLocalFilters((prev) => ({ ...prev, skills }));
    };

    const applyFilters = () => {
        const cleanedFilters = {
            ...localFilters,
            skills: localFilters.skills.map((s) => s.value),
            industries: localFilters.industries.map((i) => i.value),
        };

        if (
            !localFilters.location?.provinsi &&
            !localFilters.location?.kabupaten &&
            !localFilters.location?.kecamatan
        ) {
            delete cleanedFilters.location;
        } else {
            cleanedFilters.location = { ...localFilters.location };
            Object.keys(cleanedFilters.location).forEach((k) => {
                if (!cleanedFilters.location[k]) delete cleanedFilters.location[k];
            });
        }

        localStorage.setItem("unicru-user-filters", JSON.stringify(localFilters));
        onChange(cleanedFilters);
        setIsOpen(false);
    };

    const clearFilters = () => {
        setLocalFilters(defaultFilters);
        localStorage.setItem("unicru-user-filters", JSON.stringify(defaultFilters));
        onChange({});
        setIsOpen(false);
    };

    return (
        <div className="relative mb-4">
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-primary font-medium"
            >
                <Menu className="w-5 h-5" /> Filter
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm h-full p-6 shadow-lg overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">Filter Jobs</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="font-semibold block mb-1">Work Type</label>
                                <div className="flex gap-2 flex-wrap">
                                    {["onsite", "remote", "hybrid"].map((type) => (
                                        <label key={type} className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                value={type}
                                                checked={localFilters.workType.includes(type)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        workType: e.target.checked
                                                            ? [...prev.workType, value]
                                                            : prev.workType.filter(
                                                                  (w) => w !== value
                                                              ),
                                                    }));
                                                }}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold block mb-1">Provinsi</label>
                                <select
                                    name="location.provinsi"
                                    value={localFilters.location.provinsi}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                >
                                    <option value="">-- Select Provinsi --</option>
                                    {locationOptions.provinsi.map((prov) => (
                                        <option key={prov._id} value={prov._id}>
                                            {prov.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold block mb-1">Kabupaten</label>
                                <select
                                    name="location.kabupaten"
                                    value={localFilters.location.kabupaten}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                    disabled={!locationOptions.kabupaten.length}
                                >
                                    <option value="">-- Select Kabupaten --</option>
                                    {locationOptions.kabupaten.map((kab) => (
                                        <option key={kab._id} value={kab._id}>
                                            {kab.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold block mb-1">Kecamatan</label>
                                <select
                                    name="location.kecamatan"
                                    value={localFilters.location.kecamatan}
                                    onChange={handleChange}
                                    className="w-full border p-2 rounded"
                                    disabled={!locationOptions.kecamatan.length}
                                >
                                    <option value="">-- Select Kecamatan --</option>
                                    {locationOptions.kecamatan.map((kec) => (
                                        <option key={kec._id} value={kec._id}>
                                            {kec.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <SkillSelector
                                value={localFilters.skills}
                                onChange={handleSkillChange}
                            />

                            {/* Salary Filter */}
                            <div>
                                <label className="font-semibold block mb-1">Minimum Salary</label>
                                <input
                                    type="number"
                                    value={localFilters.minSalary || ""}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            minSalary: parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full border p-2 rounded"
                                    placeholder="e.g. 5000000"
                                />
                            </div>

                            {/* Industry Filter */}
                            <IndustrySelector
                                value={localFilters.industries || []}
                                onChange={(industries) =>
                                    setLocalFilters((prev) => ({ ...prev, industries }))
                                }
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={applyFilters}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
