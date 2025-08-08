import { useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../utils/ApiHelper";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ role, title }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        try {
            const res = await axiosInstance.post("/login/login", { email, password, role });
            localStorage.setItem("unicru-token", res.data.token);
            toast.success("Login successful!");
            setTimeout(() => navigate(`/${role}`), 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-background text-text px-4 mt-[20vh]">
            <Toaster position="top-center" />
            <form
                onSubmit={handleLogin}
                className="bg-white dark:bg-gray-900 shadow-xl rounded-xl p-8 w-full max-w-md space-y-6"
            >
                <h2 className="text-3xl font-bold text-center">
                    <span className="text-color">{title}</span>{" "}
                    <span className="text-primary">Login</span>
                </h2>

                {/* Email Field */}
                <div className="text-color">
                    <label className="block font-medium mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary text-color"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password Field with Show/Hide */}
                <div className="text-color">
                    <label className="block font-medium mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded pr-10 focus:outline focus:outline-2 focus:outline-primary"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2 text-white font-bold"
                    disabled={!email || !password || loading}
                >
                    {loading ? (
                        <>
                            <Loader className="animate-spin w-4 h-4" /> Logging in...
                        </>
                    ) : (
                        "Login"
                    )}
                </button>
                <div className="text-center text-sm flex justify-center items-center gap-2">
                    <a
                        href={`/auth/${role}/register`}
                        className="text-sm text-primary hover:underline"
                    >
                        Register
                    </a>

                    <span>or</span>

                    <a
                        href={`/forgot-password?role=${role}`}
                        className="text-sm text-primary hover:underline"
                    >
                        Forgot password?
                    </a>
                </div>
            </form>
        </div>
    );
}
