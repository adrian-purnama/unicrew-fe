import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import Navigation from "../../component/Navigation";
import { Eye, EyeOff, Check } from "lucide-react";

export default function CompanyRegister() {
    const [form, setForm] = useState({
        companyName: "",
        email: "",
        password: "",
        confirmPassword: "",
        description: "",
        industries: [],
        provinsi: "",
        kabupaten: "",
        kecamatan: "",
        website: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        acceptedTerms: false,
    });

    const [industryOptions, setIndustryOptions] = useState([]);
    const [provinsiOptions, setProvinsiOptions] = useState([]);
    const [kabupatenOptions, setKabupatenOptions] = useState([]);
    const [kecamatanOptions, setKecamatanOptions] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    const [passwordRules, setPasswordRules] = useState({
        length: false,
        number: false,
        symbol: false,
        match: false,
    });

    useEffect(() => {
        axiosInstance.get("/admin/industry").then((res) => setIndustryOptions(res.data));
        axiosInstance.get("/admin/provinsi").then((res) => setProvinsiOptions(res.data));
    }, []);

    useEffect(() => {
        if (form.provinsi) {
            axiosInstance
                .get("/admin/kabupaten", { params: { provinsi: form.provinsi } })
                .then((res) => setKabupatenOptions(res.data));
        } else {
            setKabupatenOptions([]);
        }
        setForm((prev) => ({ ...prev, kabupaten: "", kecamatan: "" }));
    }, [form.provinsi]);

    useEffect(() => {
        if (form.kabupaten) {
            axiosInstance
                .get("/admin/kecamatan", { params: { kabupaten: form.kabupaten } })
                .then((res) => setKecamatanOptions(res.data));
        } else {
            setKecamatanOptions([]);
        }
        setForm((prev) => ({ ...prev, kecamatan: "" }));
    }, [form.kabupaten]);

    useEffect(() => {
        const { password, confirmPassword } = form;
        setPasswordRules({
            length: password.length >= 8,
            number: /\d/.test(password),
            symbol: /[^a-zA-Z0-9]/.test(password),
            match: password === confirmPassword && password.length > 0,
        });
    }, [form.password, form.confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { length, number, symbol, match } = passwordRules;
        if (!form.acceptedTerms) return toast.error("You must accept terms and privacy policy.");
        if (!length || !number || !symbol || !match) {
            return toast.error("Please fix password requirements");
        }

        const payload = {
            companyName: form.companyName,
            email: form.email,
            password: form.password,
            description: form.description,
            industries: form.industries,
            location: {
                provinsi: form.provinsi,
                kabupaten: form.kabupaten,
                kecamatan: form.kecamatan,
            },
            socialLinks: {
                website: form.website,
                instagram: form.instagram,
                twitter: form.twitter,
                linkedin: form.linkedin,
            },
        };

        try {
            await axiosInstance.post("/register/company", payload);
            toast.success("Company registered. Check your email to verify.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <Input
                            label="Company Name"
                            name="companyName"
                            value={form.companyName}
                            onChange={setForm}
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={setForm}
                        />
                        <Input
                            label="Company Description"
                            name="description"
                            value={form.description}
                            onChange={setForm}
                        />
                    </>
                );
            case 2:
                return (
                    <>
                        <div className="text-color">
                            <label className="block mb-1 font-medium">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full border px-4 py-2 rounded pr-10 focus:outline-primary bg-background text-text"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-2 text-gray-400"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={setForm}
                        />

                        <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <Requirement met={passwordRules.length}>
                                At least 8 characters
                            </Requirement>
                            <Requirement met={passwordRules.symbol}>
                                At least 1 special character
                            </Requirement>
                            <Requirement met={passwordRules.number}>At least 1 number</Requirement>
                            <Requirement met={passwordRules.match}>Passwords match</Requirement>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="text-color">
                            <label className="block font-medium mb-1">Industries (max 3)</label>
                            <select
                                multiple
                                value={form.industries}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        industries: Array.from(
                                            e.target.selectedOptions,
                                            (opt) => opt.value
                                        ).slice(0, 3),
                                    })
                                }
                                className="w-full border px-4 py-2 rounded"
                            >
                                {industryOptions.map((ind) => (
                                    <option key={ind._id} value={ind._id}>
                                        {ind.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {["provinsi", "kabupaten", "kecamatan"].map((loc) => (
                            <div className="text-color" key={loc}>
                                <label className="block font-medium mb-1 capitalize">{loc}</label>
                                <select
                                    className="w-full border px-4 py-2 rounded"
                                    value={form[loc]}
                                    onChange={(e) => setForm({ ...form, [loc]: e.target.value })}
                                    disabled={
                                        loc !== "provinsi" &&
                                        !form[loc === "kabupaten" ? "provinsi" : "kabupaten"]
                                    }
                                >
                                    <option value="">Select {loc}</option>
                                    {(loc === "provinsi"
                                        ? provinsiOptions
                                        : loc === "kabupaten"
                                        ? kabupatenOptions
                                        : kecamatanOptions
                                    ).map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}

                        {["website", "instagram", "twitter", "linkedin"].map((platform) => (
                            <Input
                                key={platform}
                                label={`${
                                    platform.charAt(0).toUpperCase() + platform.slice(1)
                                } (optional)`}
                                name={platform}
                                type="url"
                                value={form[platform]}
                                onChange={setForm}
                            />
                        ))}

                        <div className="flex items-start gap-2 text-sm text-color">
                            <input
                                type="checkbox"
                                checked={form.acceptedTerms}
                                onChange={(e) =>
                                    setForm({ ...form, acceptedTerms: e.target.checked })
                                }
                            />
                            <label>
                                I agree to the{" "}
                                <a href="#" className="underline text-primary">
                                    Terms
                                </a>{" "}
                                and{" "}
                                <a href="#" className="underline text-primary">
                                    Privacy Policy
                                </a>
                                .
                            </label>
                        </div>
                    </>
                );
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1:
                return form.companyName && form.email && form.description;
            case 2:
                return Object.values(passwordRules).every(Boolean);
            case 3:
                return (
                    form.industries.length &&
                    form.provinsi &&
                    form.kabupaten &&
                    form.kecamatan &&
                    form.acceptedTerms
                );
            default:
                return false;
        }
    };

    return (
        <>
            <Navigation />
            <div className="min-h-screen flex items-center justify-center bg-background text-text px-4 py-20 bg-color-1">
                <Toaster />
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-2xl bg-color-2 shadow-xl rounded-xl p-8 space-y-6"
                >
                    <h2 className="text-3xl font-bold text-center text-color">
                        Register as <span className="color-primary">Company</span>
                    </h2>

                    <p className="text-sm text-center text-gray-500">Step {step} of 3</p>

                    {renderStep()}

                    <div className="flex justify-between pt-4">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="px-4 py-2 border rounded text-sm"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (isStepValid()) setStep(step + 1);
                                    else toast.error("Please complete all fields");
                                }}
                                className="btn-primary px-6 text-white font-bold"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn-primary px-6 text-white font-bold"
                                disabled={!isStepValid()}
                            >
                                Register
                            </button>
                        )}
                    </div>
                    <div className="text-center text-sm">
                        <a
                            href={`/auth/company/login`}
                            className="text-sm text-primary hover:underline"
                        >
                            Login
                        </a>

                        <span className="mx-2">or</span>

                        <a
                            href={`/forgot-password?role=company`}
                            className="text-sm text-primary hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>
                </form>
            </div>
        </>
    );
}

function Input({ label, name, value, onChange, type = "text" }) {
    return (
        <div className="text-color">
            <label className="block mb-1 font-medium">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange((prev) => ({ ...prev, [name]: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline-primary"
            />
        </div>
    );
}

function Requirement({ met, children }) {
    return (
        <div className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${met ? "text-green-500" : "text-gray-400"}`} />
            <span>{children}</span>
        </div>
    );
}
