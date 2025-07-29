import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import IndustrySelector from "../../component/IndustrySelector";
import ProfilePictureUploader from "../../component/ProfilePictureUploader";
import toast from "react-hot-toast";
import Navigation from "../../component/Navigation";

const CompanyProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({});
    const [locationOptions, setLocationOptions] = useState({
        provinsi: [],
        kabupaten: [],
        kecamatan: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyRes, provinsiRes] = await Promise.all([
                    axiosInstance.get("/company/profile"),
                    axiosInstance.get("/admin/provinsi"),
                ]);

                const company = companyRes.data;
                setProfile(company);

                setForm({
                    ...company,
                    industries: (company.industries || []).map((i) => ({
                        label: i.name || i,
                        value: i._id || i,
                    })),
                    location: {
                        provinsi: company.location?.provinsi?._id || company.location?.provinsi || "",
                        kabupaten: company.location?.kabupaten?._id || company.location?.kabupaten || "",
                        kecamatan: company.location?.kecamatan?._id || company.location?.kecamatan || "",
                    },
                });

                setLocationOptions((prev) => ({
                    ...prev,
                    provinsi: provinsiRes.data,
                }));
            } catch (err) {
                toast.error("Failed to load company profile");
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (form.location?.provinsi) {
            axiosInstance
                .get(`/admin/kabupaten?provinsi=${form.location.provinsi}`)
                .then((res) => setLocationOptions((prev) => ({ ...prev, kabupaten: res.data })))
                .catch(() => toast.error("Failed to load kabupaten"));
        }
    }, [form.location?.provinsi]);

    useEffect(() => {
        if (form.location?.kabupaten) {
            axiosInstance
                .get(`/admin/kecamatan?kabupaten=${form.location.kabupaten}`)
                .then((res) => setLocationOptions((prev) => ({ ...prev, kecamatan: res.data })))
                .catch(() => toast.error("Failed to load kecamatan"));
        }
    }, [form.location?.kabupaten]);

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
        } else if (["website", "linkedin", "twitter", "instagram"].includes(name)) {
            setForm((prev) => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [name]: value,
                },
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleProfilePictureChange = (file) => {
        setForm((prev) => ({ ...prev, profilePicture: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        if (form.companyName) formData.append("companyName", form.companyName);
        if (form.description) formData.append("description", form.description);
        if (form.profilePicture) formData.append("profilePicture", form.profilePicture);

        ["website", "linkedin", "twitter", "instagram"].forEach((key) => {
            const val = form.socialLinks?.[key];
            if (val) formData.append(`socialLinks[${key}]`, val);
        });

        if (form.industries?.length) {
            form.industries.forEach((ind) => {
                formData.append("industries", ind.value);
            });
        }

        Object.entries(form.location || {}).forEach(([key, val]) => {
            if (val) formData.append(`location[${key}]`, val);
        });

        const toastId = toast.loading("Updating company profile...");
        try {
            await axiosInstance.patch("/company/profile", formData);
            toast.success("Company profile updated", { id: toastId });
        } catch (err) {
            toast.error("Failed to update company profile", { id: toastId });
        }
    };

    if (!profile) return <p className="p-4 text-center">Loading...</p>;

    return (
        <>
            <Navigation />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 pt-[2rem]">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                        Company Profile
                    </h1>

                    <ProfilePictureUploader
                        initialUrl={profile.profilePicture}
                        onChange={handleProfilePictureChange}
                    />

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="companyName"
                                value={form.companyName || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <textarea
                                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="description"
                                value={form.description || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <IndustrySelector
                            value={form.industries || []}
                            onChange={(industries) => setForm((prev) => ({ ...prev, industries }))}
                        />

                        {["provinsi", "kabupaten", "kecamatan"].map((level) => (
                            <div key={level}>
                                <label className="font-semibold text-gray-700 dark:text-gray-300 block capitalize">
                                    {level} <span className="text-gray-400 text-sm">(optional)</span>
                                </label>
                                <select
                                    name={`location.${level}`}
                                    value={form.location?.[level] || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
                                >
                                    <option value="">-- Select {level} --</option>
                                    {locationOptions[level].map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}

                        {["website", "linkedin", "twitter", "instagram"].map((platform) => (
                            <div key={platform}>
                                <label className="font-semibold text-gray-700 dark:text-gray-300 block capitalize">
                                    {platform}
                                </label>
                                <input
                                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
                                    name={platform}
                                    value={form.socialLinks?.[platform] || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}

                        <button type="submit" className="btn-primary w-full">
                            Save Profile
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CompanyProfilePage;
