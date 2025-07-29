import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import { UserContext } from "../../../utils/UserContext";
import ProfilePictureUploader from "../../component/ProfilePictureUploader";
import SkillSelector from "../../component/SkillSelector";
import toast from "react-hot-toast";
import Navigation from "../../component/Navigation";

const UserProfilePage = () => {
    const { profilePicture } = useContext(UserContext);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({});
    const [locationOptions, setLocationOptions] = useState({
        provinsi: [],
        kabupaten: [],
        kecamatan: [],
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [userRes, provinsiRes] = await Promise.all([
                    axiosInstance.get("/user/profile"),
                    axiosInstance.get("/admin/provinsi"),
                ]);

                const user = userRes.data;
                setProfile(user);

                setForm({
                    ...user,
                    skills: (user.skills || []).map((s) => ({
                        value: s._id || s,
                        label: s.name || "",
                    })),
                    location: {
                        provinsi: user.location?.provinsi?._id || user.location?.provinsi || "",
                        kabupaten: user.location?.kabupaten?._id || user.location?.kabupaten || "",
                        kecamatan: user.location?.kecamatan?._id || user.location?.kecamatan || "",
                    },
                });

                setLocationOptions((prev) => ({ ...prev, provinsi: provinsiRes.data }));
            } catch (err) {
                toast.error("Failed to load profile data");
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const provinsiId = form.location?.provinsi;
        if (provinsiId) {
            axiosInstance
                .get(`/admin/kabupaten?provinsi=${provinsiId}`)
                .then((res) => setLocationOptions((prev) => ({ ...prev, kabupaten: res.data })))
                .catch(() => toast.error("Failed to load kabupaten"));
        }
    }, [form.location?.provinsi]);

    useEffect(() => {
        const kabupatenId = form.location?.kabupaten;
        if (kabupatenId) {
            axiosInstance
                .get(`/admin/kecamatan?kabupaten=${kabupatenId}`)
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
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.files[0],
        }));
    };

    const handleProfilePictureChange = (file) => {
        setForm((prev) => ({ ...prev, profilePicture: file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        if (form.aboutMe) formData.append("aboutMe", form.aboutMe);
        if (form.fullName) formData.append("fullName", form.fullName);
        if (form.skills?.length) {
            form.skills.forEach((skill) => {
                formData.append("skills", skill.value);
            });
        }

        if (form.profilePicture) formData.append("profilePicture", form.profilePicture);
        if (form.cv) formData.append("cv", form.cv);
        if (form.portfolio) formData.append("portfolio", form.portfolio);

        Object.entries(form.location || {}).forEach(([key, val]) => {
            if (val) formData.append(`location[${key}]`, val);
        });

        const toastId = toast.loading("Updating profile...");
        try {
            await axiosInstance.patch("/user/profile", formData);
            toast.success("Profile updated", { id: toastId });
        } catch (err) {
            toast.error("Failed to update profile", { id: toastId });
        }
    };

    if (!profile) return <p className="p-4 text-center">Loading...</p>;

    return (
        <>
        <Navigation />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 pt-[2rem]">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                        Your Profile
                    </h1>

                    <ProfilePictureUploader
                        initialUrl={profilePicture}
                        onChange={handleProfilePictureChange}
                    />

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                name="fullName"
                                value={form.fullName || ""}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300">
                                Email (read-only)
                            </label>
                            <input
                                className="w-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
                                value={profile.email}
                                disabled
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300">
                                About Me
                            </label>
                            <textarea
                                name="aboutMe"
                                value={form.aboutMe || ""}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <SkillSelector
                            value={form.skills || []}
                            onChange={(skills) => setForm((prev) => ({ ...prev, skills }))}
                        />

                        {["provinsi", "kabupaten", "kecamatan"].map((level) => (
                            <div key={level}>
                                <label className="font-semibold text-gray-700 dark:text-gray-300 block capitalize">
                                    {level}{" "}
                                    {level === "provinsi" ? (
                                        <span className="text-red-500">*</span>
                                    ) : (
                                        <span className="text-gray-400 text-sm">(optional)</span>
                                    )}
                                </label>
                                <select
                                    name={`location.${level}`}
                                    value={form.location?.[level] || ""}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded"
                                    required={level === "provinsi"}
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

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 block">
                                CV
                            </label>
                            <input type="file" name="cv" onChange={handleFileChange} />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 dark:text-gray-300 block">
                                Portfolio
                            </label>
                            <input type="file" name="portfolio" onChange={handleFileChange} />
                        </div>

                        {profile.curriculumVitae && (
                            <div className="mt-2">
                                <a
                                    href={profile.curriculumVitae}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    📄 View current CV
                                </a>
                            </div>
                        )}

                        {profile.portfolio && (
                            <div className="mt-2">
                                <a
                                    href={profile.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    🎨 View current Portfolio
                                </a>
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full">
                            Save Profile
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UserProfilePage;
