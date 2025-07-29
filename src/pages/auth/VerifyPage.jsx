import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/ApiHelper";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
// import verifyImg from "../../../assets/email-verify.svg";

export default function VerifyPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("idle");
    const [attempts, setAttempts] = useState(0);

    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    const handleVerify = async () => {
        try {
            setStatus("loading");
            const res = await axiosInstance.post("/auth/verify", {
                email,
                otp: token,
                role,
            });

            localStorage.setItem("unicru-token", res.data.token);
            setStatus("success");
        } catch (err) {
            setStatus("error");
            setAttempts((prev) => prev + 1);
            console.error(err);
        }
    };

    useEffect(() => {
        if (status === "success") {
            // const timer = setTimeout(() => navigate("/"), 2000);
            const timer = setTimeout(() => location.reload(), 2000);
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-gray-100 dark:to-gray-900 text-text px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="hidden md:block">
                    <img src="src\assets\icons\email verify.svg" alt="Verify" className="w-full h-auto object-contain" />
                </div>

                <div className="text-center space-y-6">
                    <h1 className="text-3xl font-bold">Verify Your Email</h1>
                    {status === "idle" && (
                        <>
                            <p className="text-gray-600 dark:text-gray-300">
                                Click below to confirm your email and activate your account.
                            </p>
                            <button onClick={handleVerify} className="btn-primary px-6 py-2">
                                Verify Email
                            </button>
                        </>
                    )}

                    {status === "loading" && (
                        <p className="flex items-center justify-center gap-2 text-blue-500 animate-pulse">
                            <Loader2 className="animate-spin" size={20} /> Verifying...
                        </p>
                    )}

                    {status === "success" && (
                        <p className="text-green-600 font-medium flex items-center justify-center gap-2 animate-fade-in">
                            <CheckCircle size={20} /> Email successfully verified! Redirecting...
                        </p>
                    )}

                    {status === "error" && (
                        <div className="text-red-600 font-medium flex flex-col items-center justify-center gap-2 animate-shake">
                            <div className="flex items-center gap-2">
                                <XCircle size={20} /> Verification failed. Please try again.
                            </div>
                            {attempts > 1 && (
                                <p className="text-sm text-red-400">Attempted {attempts} times</p>
                            )}
                            <button
                                onClick={handleVerify}
                                className="mt-2 text-sm underline text-primary hover:text-opacity-80"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
