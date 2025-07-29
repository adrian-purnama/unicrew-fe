import { useEffect, useState } from "react";
import { Check, X as Cross } from "lucide-react";
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
            if (missingFields.length > 0) setShow(true);
        } catch (err) {
            console.error("Failed to check profile:", err.message);
        }
    };

    const dismiss = () => {
        localStorage.setItem(PROFILE_REMINDER_KEY, Date.now().toString());
        setShow(false);
    };

    const fillNow = () => {
        dismiss();
        navigate("/user/profile");
    };

    const percent = Math.round(((fields.length - missing.length) / fields.length) * 100);

    return (
        <BaseModal isOpen={show} onClose={dismiss} title="Complete Your Profile">
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

            <div className="flex justify-end gap-2">
                <button
                    onClick={dismiss}
                    className="btn-primary text-white font-bold"
                >
                    I'll do it later
                </button>
                <button
                    onClick={fillNow}
                    className="btn-primary text-white font-bold"
                >
                    Fill Now
                </button>
            </div>
        </BaseModal>
    );
}
