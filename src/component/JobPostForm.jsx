import { useEffect, useState } from "react";
import SkillSelector from "./SkillSelector";
import axiosInstance from "../../utils/ApiHelper";

export default function JobPostForm({ onSuccess }) {
    const [form, setForm] = useState({
        title: "",
        workType: "onsite",
        location: { provinsi: "", kabupaten: "", kecamatan: "" },
        requiredSkills: [],
        minSalary: "",
        maxSalary: "",
        additionalInfo: "",
    });

    const [locationOptions, setLocationOptions] = useState({
        provinsi: [],
        kabupaten: [],
        kecamatan: [],
    });

    useEffect(() => {
        axiosInstance.get("/admin/provinsi").then((res) =>
            setLocationOptions((prev) => ({
                ...prev,
                provinsi: res.data,
            }))
        );
    }, []);

    useEffect(() => {
        if (form.location.provinsi) {
            axiosInstance
                .get(`/admin/kabupaten?provinsi=${form.location.provinsi}`)
                .then((res) => setLocationOptions((prev) => ({ ...prev, kabupaten: res.data })));
        }
    }, [form.location.provinsi]);

    useEffect(() => {
        if (form.location.kabupaten) {
            axiosInstance
                .get(`/admin/kecamatan?kabupaten=${form.location.kabupaten}`)
                .then((res) => setLocationOptions((prev) => ({ ...prev, kecamatan: res.data })));
        }
    }, [form.location.kabupaten]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title: form.title,
            description: form.additionalInfo, 
            workType: form.workType,
            location: form.workType !== "remote" ? form.location : undefined,
            requiredSkills: form.skills.map((s) => s.value),
            salaryMin: form.minSalary,
            salaryMax: form.maxSalary,
        };

        if (form.workType === "remote") {
            delete payload.location;
        }

        await axiosInstance.post("/company/job", payload);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <>
                    <div>
                        <label className="font-semibold block">Provinsi</label>
                        <select
                            name="location.provinsi"
                            value={form.location.provinsi}
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
                        <label className="font-semibold block">Kabupaten</label>
                        <select
                            name="location.kabupaten"
                            value={form.location.kabupaten}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
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
                        <label className="font-semibold block">Kecamatan</label>
                        <select
                            name="location.kecamatan"
                            value={form.location.kecamatan}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">-- Select Kecamatan --</option>
                            {locationOptions.kecamatan.map((kec) => (
                                <option key={kec._id} value={kec._id}>
                                    {kec.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            )}

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

            <div>
                <label className="font-semibold block">Additional Info</label>
                <textarea
                    name="additionalInfo"
                    value={form.additionalInfo}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
            </div>

            <button
                type="submit"
                className="btn-primary px-4 py-2 "
            >
                Post Job
            </button>
        </form>
    );
}
