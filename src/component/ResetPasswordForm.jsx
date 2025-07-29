import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Check } from "lucide-react";

export default function ResetPasswordForm() {
  const [params] = useSearchParams();
  const email = params.get("email");
  const token = params.get("token");
  const role = params.get("role");

  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const passwordRules = {
    length: newPassword.length >= 8,
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    match: newPassword === verifyPassword && verifyPassword !== "",
  };

  const isValid =
    passwordRules.length &&
    passwordRules.symbol &&
    passwordRules.number &&
    passwordRules.match;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return toast.error("Please meet all password requirements");

    try {
      await axiosInstance.post("/auth/reset-password", {
        email,
        token,
        role,
        newPassword,
      });
      toast.success("Password has been reset!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-10 text-text">
      <Toaster />
      <h2 className="text-2xl font-semibold mb-4 text-center">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block font-medium mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded px-4 py-2 pr-10"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Verify Password */}
        <div>
          <label className="block font-medium mb-1">Verify Password</label>
          <div className="relative">
            <input
              type={showVerify ? "text" : "password"}
              className="w-full border rounded px-4 py-2 pr-10"
              placeholder="Re-type your password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-500"
              onClick={() => setShowVerify((prev) => !prev)}
            >
              {showVerify ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password Checklist */}
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

        <button
          className="btn-primary w-full mt-4"
          type="submit"
          disabled={!isValid}
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
