import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Check } from "lucide-react";
import Navigation from "../../component/Navigation";

export default function AdminRegister() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    number: false,
    symbol: false,
    match: false,
  });

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
      return toast.error("Please fix password requirements.");
    }

    try {
      await axiosInstance.post("/register/admin", {
        email: form.email,
        password: form.password,
      });
      toast.success("Registered successfully. Check your email to verify.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-background text-text px-4 py-12">
        <Toaster position="top-center" />
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 shadow-lg p-8 rounded-xl w-full max-w-md space-y-6"
        >
          <h2 className="text-3xl font-bold text-center">Admin Registration</h2>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded pr-10 focus:outline focus:outline-2 focus:outline-primary"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-400"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
            />
          </div>

          {/* Password rules */}
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

          <div className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })}
            />
            <label>
              I agree to the <a href="#" className="underline text-primary">Terms</a> and <a href="#" className="underline text-primary">Privacy Policy</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={
              !form.email ||
              !form.password ||
              !form.confirmPassword ||
              !form.acceptedTerms ||
              Object.values(passwordRules).includes(false)
            }
            className="btn-primary w-full"
          >
            Register Admin
          </button>
        </form>
      </div>
    </>
  );
}
