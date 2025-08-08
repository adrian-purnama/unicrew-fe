import { useEffect, useState } from "react";
import { Check, X as Cross, Clock } from "lucide-react";
import BaseModal from "./BaseModal";
import axiosInstance from "../../utils/ApiHelper";
import { useNavigate } from "react-router-dom";

const PROFILE_REMINDER_KEY = "lastProfilePrompt";

const fields = [
    { key: "aboutMe", label: "About Me" },
    { key: "skills", label: "Skills" },
    { key: "location.provinsi", label: "Provinsi" },
    { key: "location.kabupaten", label: "Kabupaten" },
    { key: "location.kecamatan", label: "Kecamatan" },
];

export default function ProfileReminderModal() {
    const [show, setShow] = useState(false);
    const [missing, setMissing] = useState([]);
    const [isVerified, setIsVerified] = useState(true);
    const [daysRemaining, setDaysRemaining] = useState(null);
    const [createdAt, setCreatedAt] = useState(null);
    const [snoozeChecked, setSnoozeChecked] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const lastShown = localStorage.getItem(PROFILE_REMINDER_KEY);
        const now = Date.now();

        if (!lastShown || now - parseInt(lastShown) > 86400000) {
            checkProfile();
        }
    }, []);

    const checkProfile = async () => {
        try {
            const res = await axiosInstance.get("/user/profile-check");
            const missingFieldKeys = res.data.missingFields || [];

            const missingFields = fields.filter((f) =>
                missingFieldKeys.includes(f.key.replace(".", "_"))
            );

            setMissing(missingFields);
            setIsVerified(res.data.isVerified);
            setDaysRemaining(res.data.daysRemainingUntilDeletion ?? null);
            setCreatedAt(res.data.createdAt); // You might need to add this in backend

            if (missingFields.length > 0 || !res.data.isVerified) setShow(true);
        } catch (err) {
            console.error("Failed to check profile:", err.message);
        }
    };

    const dismiss = () => {
        if (snoozeChecked) {
            localStorage.setItem(PROFILE_REMINDER_KEY, Date.now().toString());
        } else {
            localStorage.removeItem(PROFILE_REMINDER_KEY);
        }
        setShow(false);
    };

    const fillNow = () => {
        dismiss();
        navigate("/user/profile");
    };

    const resendEmail = async () => {
        try {
            const token = localStorage.getItem("unicru-token");
            await axiosInstance.post("/auth/reverify", { token });
            alert("Verification email resent!");
        } catch (err) {
            alert("Failed to resend verification email.");
        }
    };

    const percent = Math.round(((fields.length - missing.length) / fields.length) * 100);

    const isRecentlyCreated = () => {
        if (!createdAt) return false;
        const created = new Date(createdAt).getTime();
        return Date.now() - created < 2 * 60 * 60 * 1000; // < 2 hours
    };

    return (
        <BaseModal isOpen={show} onClose={dismiss} title="Complete Your Profile">
            {!isVerified && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <strong>Email not verified.</strong>
                            <br />
                            {isRecentlyCreated() ? (
                                <span>
                                    Please check your email (and spam folder) to verify your
                                    account.
                                </span>
                            ) : (
                                <span>
                                    Your account will be deleted in{" "}
                                    <strong>{daysRemaining} days</strong> if not verified.{" "}
                                    <button
                                        onClick={resendEmail}
                                        className="text-blue-600 underline ml-1"
                                    >
                                        Resend verification link
                                    </button>
                                </span>
                            )}
                        </div>
                        <Clock className="w-5 h-5 text-red-500" />
                    </div>
                </div>
            )}

            <p className="text-black mb-4 text-center">
                You've completed <strong>{percent}%</strong> of your profile.
            </p>

            <ul className="space-y-2 mb-6">
                {fields.map((f) => {
                    const isMissing = missing.some((m) => m.key === f.key);
                    return (
                        <li key={f.key} className="flex items-center gap-2 text-sm text-black">
                            {isMissing ? (
                                <Cross className="text-red-500 w-4 h-4" />
                            ) : (
                                <Check className="text-green-500 w-4 h-4" />
                            )}
                            {f.label}
                        </li>
                    );
                })}
            </ul>

            <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                    type="checkbox"
                    checked={snoozeChecked}
                    onChange={(e) => setSnoozeChecked(e.target.checked)}
                />
                Don't show again for 1 day
            </label>
            <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                    <button onClick={dismiss} className="btn-primary text-white font-bold">
                        I'll do it later
                    </button>
                    <button onClick={fillNow} className="btn-primary text-white font-bold">
                        Fill Now
                    </button>
                </div>
            </div>
        </BaseModal>
    );
}
