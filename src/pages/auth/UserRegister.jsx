import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Check } from "lucide-react";
import Navigation from "../../component/Navigation";
import CustomSelect from "../../component/CustomSelect";
import { useNavigate } from "react-router-dom";

export default function UserRegister() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        fullName: "",
        birthDate: "",
        email: "",
        password: "",
        confirmPassword: "",
        university: "",
        studyProgram: "",
        externalSystemId: "",
        acceptedTerms: false,
    });

    const [universities, setUniversities] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    const [passwordRules, setPasswordRules] = useState({
        length: false,
        number: false,
        symbol: false,
        match: false,
    });

    useEffect(() => {
        axiosInstance.get("/admin/university").then((res) => setUniversities(res.data || []));
        axiosInstance.get("/admin/study-program").then((res) => setPrograms(res.data || []));
    }, []);

    useEffect(() => {
        const { password, confirmPassword } = form;
        const rules = {
            length: password.length >= 8,
            number: /\d/.test(password),
            symbol: /[^a-zA-Z0-9]/.test(password),
            match: password === confirmPassword && password.length > 0,
        };
        setPasswordRules(rules);
    }, [form.password, form.confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { length, number, symbol, match } = passwordRules;

        if (!form.acceptedTerms) return toast.error("You must accept terms and privacy policy.");
        if (!form.email.endsWith(".ac.id") && !form.email.endsWith(".edu")) {
            return toast.error("Email must end with .ac.id or .edu");
        }
        if (!length || !number || !symbol || !match) {
            return toast.error("Please fix password requirements");
        }

        try {
            const payload = { ...form };
            delete payload.confirmPassword;
            const res = await axiosInstance.post("/register/user", payload);
            const { token } = res.data;
            localStorage.setItem("unicru-token", token);
            toast.success("Registered and logged in!");
                        setTimeout(() => navigate(`/user`), 1000);

            
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
                            label="Full Name"
                            name="fullName"
                            value={form.fullName}
                            onChange={setForm}
                        />
                        <Input
                            label="Birth Date"
                            name="birthDate"
                            type="date"
                            value={form.birthDate}
                            onChange={setForm}
                        />
                        <Input
                            label="Email (.ac.id / .edu)"
                            name="email"
                            type="email"
                            value={form.email}
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
                        <Input
                            label="External System ID (NIM)"
                            name="externalSystemId"
                            value={form.externalSystemId}
                            onChange={setForm}
                        />
                        <CustomSelect
                            label="Select University"
                            endpoint="/admin/university"
                            value={form.university}
                            onChange={(val) => setForm({ ...form, university: val?.value || "" })}
                        />
                        <CustomSelect
                            label="Select Study Program"
                            endpoint="/admin/study-program"
                            value={form.studyProgram}
                            onChange={(val) => setForm({ ...form, studyProgram: val?.value || "" })}
                        />
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
                return form.fullName && form.birthDate && form.email;
            case 2:
                return Object.values(passwordRules).every(Boolean);
            case 3:
                return (
                    form.externalSystemId &&
                    form.university &&
                    form.studyProgram &&
                    form.acceptedTerms
                );
            default:
                return false;
        }
    };

    return (
        <>
            <Navigation />
            <div className="min-h-screen flex items-center justify-center bg-background text-text px-4 py-[4rem] bg-color-1">
                <Toaster />
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-2xl bg-color-2 shadow-xl rounded-xl p-8 space-y-6"
                >
                    <h2 className="text-3xl font-bold text-center text-color">
                        Register as <span className="color-primary">Student</span>
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
                            href={`/auth/user/login`}
                            className="text-sm text-primary hover:underline"
                        >
                            Login
                        </a>

                        <span className="mx-2">or</span>

                        <a
                            href={`/forgot-password?role=user`}
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

// Reusable field component
function Input({ label, name, type = "text", value, onChange }) {
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

// Requirement bullet
function Requirement({ met, children }) {
    return (
        <div className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${met ? "text-green-500" : "text-gray-400"}`} />
            <span>{children}</span>
        </div>
    );
}
