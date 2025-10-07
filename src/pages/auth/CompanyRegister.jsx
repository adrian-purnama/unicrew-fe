// CompanyRegister.jsx — improved
import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import Navigation from "../../component/Navigation";
import { Eye, EyeOff, Check } from "lucide-react";
import IndustrySelector from "../../component/IndustrySelector";
import LocationSelector from "../../component/LocationSelector";

export default function CompanyRegister() {
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    industries: [],            // array of {label, value} (from IndustrySelector)
    location: {                // used by LocationSelector
      provinsi: "",
      kabupaten: "",
      kecamatan: "",
    },
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    acceptedTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

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
      return toast.error("Please fix password requirements");
    }

    // Map IndustrySelector value -> ids
    const industryIds = (form.industries || []).map((x) => (typeof x === "string" ? x : x.value)).slice(0, 3);

    const payload = {
      companyName: form.companyName,
      email: form.email,
      password: form.password,
      description: form.description,
      industries: industryIds,
      location: {
        // DTO expects *Id keys; map from LocationSelector's value keys
        provinsiId: form.location.provinsi,
        kabupatenId: form.location.kabupaten,
        kecamatanId: form.location.kecamatan,
      },
      socialLinks: {
        website: form.website,
        instagram: form.instagram,
        twitter: form.twitter,
        linkedin: form.linkedin,
      },
    };

    const doReq = () => axiosInstance.post("/register/company", payload);

    try {
      setSubmitting(true);
      await toast.promise(
        doReq(),
        {
          loading: "Creating company account…",
          success: "Company registered. Check your email to verify ✉️",
          error: (err) => err?.response?.data?.message || "Registration failed",
        },
        {
          success: { duration: 4000 },
          error: { duration: 5000 },
        }
      );
      // Optionally redirect after success
      // navigate("/auth/company/login");
    } catch {
      // handled by toast.promise
    } finally {
      setSubmitting(false);
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
            <TextareaWithCounter
              label="Company Description"
              name="description"
              value={form.description}
              onChange={setForm}
              maxLength={200}
              placeholder="Briefly describe your company, its mission, and what makes it unique..."
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
                  className="w-full border px-4 py-2 rounded pr-10 focus:outline-primary bg-color-1 text-text"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              <Requirement met={passwordRules.length}>At least 8 characters</Requirement>
              <Requirement met={passwordRules.symbol}>At least 1 special character</Requirement>
              <Requirement met={passwordRules.number}>At least 1 number</Requirement>
              <Requirement met={passwordRules.match}>Passwords match</Requirement>
            </div>
          </>
        );
      case 3:
        return (
          <>
            {/* Industry selector (searchable, multi) */}
            <IndustrySelector
              value={form.industries}
              onChange={(selected) => {
                const top3 = (selected || []).slice(0, 3);
                setForm({ ...form, industries: top3 });
              }}
            />

            {/* Location selector (provinsi→kabupaten→kecamatan) */}
            <div className="text-color">
              <label className="block font-medium mb-1">Company Location</label>
              <LocationSelector
                value={form.location}
                onChange={(val) => setForm({ ...form, location: val })}
              />
            </div>

            {/* Social links */}
            {["website", "instagram", "twitter", "linkedin"].map((platform) => (
              <Input
                key={platform}
                label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} (optional)`}
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
                onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })}
              />
              <label>
                I agree to the{" "}
                <a href="#" className="underline text-primary">Terms</a> and{" "}
                <a href="#" className="underline text-primary">Privacy Policy</a>.
              </label>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!(form.companyName && form.email && form.description);
      case 2:
        return Object.values(passwordRules).every(Boolean);
      case 3: {
        const industryIds = (form.industries || []).map((x) => (typeof x === "string" ? x : x.value));
        const { provinsi, kabupaten, kecamatan } = form.location || {};
        return industryIds.length > 0 && provinsi && kabupaten && kecamatan && form.acceptedTerms;
      }
      default:
        return false;
    }
  };

  return (
    <>
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
                disabled={submitting}
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
                disabled={submitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary px-6 text-white font-bold"
                disabled={!isStepValid() || submitting}
              >
                {submitting ? "Registering…" : "Register"}
              </button>
            )}
          </div>

          <div className="text-center text-sm">
            <a href={`/auth/company/login`} className="text-sm text-primary hover:underline">
              Login
            </a>
            <span className="mx-2">or</span>
            <a href={`/forgot-password?role=company`} className="text-sm text-primary hover:underline">
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
        className="w-full border border-gray bg-color-1 text-text px-4 py-2 rounded focus:outline-primary"
      />
    </div>
  );
}

function TextareaWithCounter({ label, name, value, onChange, maxLength, placeholder }) {
  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars < 50;
  const isAtLimit = remainingChars <= 0;
  
  return (
    <div className="text-color">
      <label className="block mb-1 font-medium">{label}</label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onChange((prev) => ({ ...prev, [name]: e.target.value }));
            }
          }}
          placeholder={placeholder}
          className={`w-full border border-gray bg-color-1 text-text px-4 py-2 rounded focus:outline-primary resize-none transition-colors ${
            isAtLimit ? 'border-red-300 bg-red-50' : 
            isNearLimit ? 'border-yellow-300 bg-yellow-50' : ''
          }`}
          rows={4}
        />
        <div className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded ${
          isAtLimit ? 'bg-red-100 text-red-600' :
          isNearLimit ? 'bg-yellow-100 text-yellow-600' :
          'bg-gray-100 text-gray-500'
        }`}>
          {remainingChars} characters left
        </div>
      </div>
      {isAtLimit && (
        <p className="text-red-500 text-xs mt-1">Character limit reached</p>
      )}
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
