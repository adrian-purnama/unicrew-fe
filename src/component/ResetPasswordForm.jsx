// src/component/ResetPasswordForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Check } from "lucide-react";
import axiosInstance from "../../utils/ApiHelper"; // adjust path if needed

export default function ResetPasswordForm() {
  const [sp] = useSearchParams();
  const navigate = useNavigate()

  // read from URL params only (do not render inputs for these)
  const role  = (sp.get("role")  || "user").toLowerCase();
  const email = (sp.get("email") || "").trim();
  const token = (sp.get("token") || "").trim();

  const paramsOk = useMemo(() => !!role && !!email && !!token, [role, email, token]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [rules, setRules] = useState({
    length: false,
    number: false,
    symbol: false,
    match:  false,
  });

  useEffect(() => {
    setRules({
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
      match:  password.length > 0 && password === confirm,
    });
  }, [password, confirm]);

  const allGood = rules.length && rules.number && rules.symbol && rules.match && paramsOk;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paramsOk) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }
    if (!allGood) {
      toast.error("Please fix password requirements.");
      return;
    }

    const req = axiosInstance.post("/auth/reset-password", {
      role,
      email,
      token,
      newPassword: password,
    });

    setSaving(true);
    await toast.promise(req, {
      loading: "Updating password…",
      success: "Password updated. You can now log in.",
      error: (err) => err?.response?.data?.message || "Reset failed",
    }).finally(() => setSaving(false));

    setPassword("");
    setConfirm("");
    navigate(`/auth/${role}/login`)

  };

  if (!paramsOk) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-600">This reset link is invalid or incomplete.</div>
        <Link to="/auth/forgot-password" className="underline text-primary text-sm">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-color">
      {/* New Password */}
      <div>
        <label className="block font-medium mb-1">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray bg-color-1 text-text px-4 py-2 rounded pr-10 focus:outline focus:outline-2 focus:outline-primary"
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block font-medium mb-1">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border border-gray bg-color-1 text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
        />
      </div>

      {/* Password rules */}
      <div className="space-y-1 text-sm text-gray">
        <div className="flex items-center gap-2">
          {rules.length && <Check className="text-green-500 w-4 h-4" />}
          <span>At least 8 characters</span>
        </div>
        <div className="flex items-center gap-2">
          {rules.symbol && <Check className="text-green-500 w-4 h-4" />}
          <span>At least 1 special character</span>
        </div>
        <div className="flex items-center gap-2">
          {rules.number && <Check className="text-green-500 w-4 h-4" />}
          <span>At least 1 number</span>
        </div>
        <div className="flex items-center gap-2">
          {rules.match && <Check className="text-green-500 w-4 h-4" />}
          <span>Passwords match</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!allGood || saving}
        className="btn-primary w-full font-bold"
      >
        {saving ? "Updating…" : "Reset Password"}
      </button>
    </form>
  );
}
