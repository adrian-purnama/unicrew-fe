import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Check } from "lucide-react";
import Navigation from "../../component/Navigation";

export default function UserRegister() {
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
    const [passwordRules, setPasswordRules] = useState({
        length: false,
        number: false,
        symbol: false,
        match: false,
    });

    const inputRefs = useRef([]);

    useEffect(() => {
        axiosInstance
            .get("/admin/university")
            .then((res) => setUniversities(res.data || []))
            .catch(() => toast.error("Failed to fetch universities"));

        axiosInstance
            .get("/admin/study-program")
            .then((res) => setPrograms(res.data || []))
            .catch(() => toast.error("Failed to fetch study programs"));
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
            await axiosInstance.post("/register/user", payload);
            toast.success("Registered! Check email to verify.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        }
    };

    const handleKeyDown = (e, i) => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputRefs.current[i + 1]?.focus();
        }
    };

    return (
        <>
            <Navigation />
            <div className="min-h-screen flex items-center justify-center bg-background text-text px-4 py-[4rem] bg-color-1">
                <Toaster />
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl rounded-xl p-8 space-y-6"
                >
                    <h2 className="text-3xl font-bold text-center text-color">Register As <span className="color-primary">Student</span></h2>

                    {[
                        { label: "Full Name", name: "fullName", type: "text" },
                        { label: "Birth Date", name: "birthDate", type: "date" },
                        { label: "Email (.ac.id / .edu)", name: "email", type: "email" },
                        { label: "External System ID", name: "externalSystemId", type: "text" },
                    ].map((field, i) => (
                        <div key={field.name}>
                            <label className="block mb-1 font-medium text-color">{field.label}</label>
                            <input
                                ref={(el) => (inputRefs.current[i] = el)}
                                type={field.type}
                                value={form[field.name]}
                                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline-primary"
                            />
                        </div>
                    ))}

                    <div className="text-color">
                        <label className="block mb-1 font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                onKeyDown={(e) => handleKeyDown(e, 4)}
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

                    <div className="text-color">
                        <label className="block mb-1 font-medium">Confirm Password</label>
                        <input
                            type="password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, 5)}
                            className="w-full border px-4 py-2 rounded focus:outline-primary bg-background text-text"
                        />
                    </div>

                    <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            {passwordRules.length && <Check className="text-green-500 w-4 h-4" />}
                            <span>At least 8 characters</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {passwordRules.symbol && <Check className="text-green-500 w-4 h-4" />}
                            <span>At least 1 special character</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {passwordRules.number && <Check className="text-green-500 w-4 h-4" />}
                            <span>At least 1 number</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {passwordRules.match && <Check className="text-green-500 w-4 h-4" />}
                            <span>Passwords match</span>
                        </div>
                    </div>

                    <div className="text-color">
                        <label className="block mb-1 font-medium">Select University</label>
                        <select
                            value={form.university}
                            onChange={(e) => setForm({ ...form, university: e.target.value })}
                            className="w-full border px-4 py-2 rounded bg-color-2 text-text"
                        >
                            <option value="">-- Select University --</option>
                            {universities.map((uni) => (
                                <option key={uni._id} value={uni._id}>
                                    {uni.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-color">
                        <label className="block mb-1 font-medium">Select Study Program</label>
                        <select
                            value={form.studyProgram}
                            onChange={(e) => setForm({ ...form, studyProgram: e.target.value })}
                            className="w-full border px-4 py-2 rounded bg-color-2 text-text"
                        >
                            <option value="">-- Select Program --</option>
                            {programs.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-color">
                        <input
                            type="checkbox"
                            checked={form.acceptedTerms}
                            onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })}
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

                    <button
                        type="submit"
                        disabled={
                            !form.fullName ||
                            !form.birthDate ||
                            !form.email ||
                            !form.password ||
                            !form.confirmPassword ||
                            !form.university ||
                            !form.studyProgram ||
                            !form.acceptedTerms ||
                            Object.values(passwordRules).includes(false)
                        }
                        className="btn-primary w-full text-white font-bold"
                    >
                        Register
                    </button>
                </form>
            </div>
        </>
    );
}
