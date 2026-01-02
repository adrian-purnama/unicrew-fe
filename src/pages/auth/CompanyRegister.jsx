// CompanyRegister.jsx — improved
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import Navigation from "../../component/Navigation";
import { Eye, EyeOff, Check } from "lucide-react";
import IndustrySelector from "../../component/IndustrySelector";
import LocationSelector from "../../component/LocationSelector";

export default function CompanyRegister() {
  const navigate = useNavigate();
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
  const [websiteError, setWebsiteError] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  const [passwordRules, setPasswordRules] = useState({
    length: false,
    number: false,
    symbol: false,
    match: false,
  });

  // URL validation function
  const validateURL = (url) => {
    if (!url) return true; // Empty is valid (optional field)
    try {
      const urlObj = new URL(url);
      // Must be http or https
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      // Try adding https:// prefix if missing
      try {
        const urlWithProtocol = url.startsWith("http://") || url.startsWith("https://") 
          ? url 
          : `https://${url}`;
        new URL(urlWithProtocol);
        return true;
      } catch {
        return false;
      }
    }
  };

  useEffect(() => {
    const { password, confirmPassword } = form;
    setPasswordRules({
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
      match: password === confirmPassword && password.length > 0,
    });
  }, [form.password, form.confirmPassword]);

  // Cooldown timer for resend code
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleSendCode = async () => {
    if (!form.email) {
      return toast.error("Please enter your email first");
    }

    setSendingCode(true);
    try {
      await axiosInstance.post("/register/send-verification-code", {
        email: form.email,
        role: "company",
      });
      toast.success("Verification code sent to your email");
      setCodeSent(true);
      setCooldown(120); // 2 minutes cooldown
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode || otpCode.length !== 6) {
      return toast.error("Please enter a valid 6-digit code");
    }

    setVerifyingCode(true);
    try {
      const res = await axiosInstance.post("/register/verify-email-code", {
        email: form.email,
        role: "company",
        otp: otpCode,
      });
      setVerificationToken(res.data.verificationToken);
      toast.success("Email verified successfully");
      setStep(3); // Move to password step
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid verification code");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { length, number, symbol, match } = passwordRules;
    if (!verificationToken) {
      return toast.error("Please verify your email first");
    }
    if (!form.acceptedTerms) return toast.error("You must accept terms and privacy policy.");
    if (!length || !number || !symbol || !match) {
      return toast.error("Please fix password requirements");
    }

    // Validate website URL if provided
    if (form.website && !validateURL(form.website)) {
      setWebsiteError("Please enter a valid URL (e.g., https://example.com or example.com)");
      return toast.error("Invalid website URL. Please check the format.");
    }

    // Map IndustrySelector value -> ids
    const industryIds = (form.industries || []).map((x) => (typeof x === "string" ? x : x.value)).slice(0, 3);

    // Normalize website URL - add https:// if missing
    const normalizeURL = (url) => {
      if (!url) return "";
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      return `https://${url}`;
    };

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
        website: normalizeURL(form.website),
        instagram: form.instagram,
        twitter: form.twitter,
        linkedin: form.linkedin,
      },
      verificationToken,
    };

    const doReq = () => axiosInstance.post("/register/company", payload);

    try {
      setSubmitting(true);
      const res = await toast.promise(
        doReq(),
        {
          loading: "Creating company account…",
          success: "Company registered successfully! 🎉",
          error: (err) => err?.response?.data?.message || "Registration failed",
        },
        {
          success: { duration: 4000 },
          error: { duration: 5000 },
        }
      );

      // Save token and redirect
      const { token } = res.data || {};
      if (token) {
        localStorage.setItem("unicru-token", token);
        setTimeout(() => {
          window.location.href = `/company`;
        }, 1000);
      }
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
              placeholder="e.g., Tech Solutions Inc."
              example="Example: Tech Solutions Inc."
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={setForm}
              placeholder="e.g., contact@company.com"
              example="Example: contact@company.com"
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
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="w-full border border-gray bg-gray-100 text-text px-4 py-2 rounded cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Verify this email address</p>
            </div>

            {!codeSent ? (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || cooldown > 0}
                className="w-full btn-primary px-6 py-2 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingCode ? "Sending..." : cooldown > 0 ? `Resend in ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}` : "Send Verification Code"}
              </button>
            ) : (
              <>
                <div className="text-color">
                  <label className="block mb-1 font-medium">Verification Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(value);
                    }}
                    placeholder="Enter 6-digit code"
                    className="w-full border border-gray bg-color-1 text-text px-4 py-2 rounded focus:outline-primary text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Check your email for the verification code</p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || otpCode.length !== 6}
                  className="w-full btn-primary px-6 py-2 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyingCode ? "Verifying..." : "Verify Email"}
                </button>

                {cooldown > 0 ? (
                  <p className="text-xs text-center text-gray-500">
                    Resend code in {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="w-full text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </>
            )}
          </>
        );
      case 3:
        return (
          <>
            <div className="text-color">
              <label className="block mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
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
              <p className="text-xs text-gray-500 mt-1">Example: MyP@ssw0rd123</p>
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={setForm}
              placeholder="Re-enter your password"
            />

            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
              <Requirement met={passwordRules.length}>At least 8 characters</Requirement>
              <Requirement met={passwordRules.symbol}>At least 1 special character</Requirement>
              <Requirement met={passwordRules.number}>At least 1 number</Requirement>
              <Requirement met={passwordRules.match}>Passwords match</Requirement>
            </div>
          </>
        );
      case 4:
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

            {/* Website with validation */}
            <div className="text-color">
              <label className="block mb-1 font-medium">Website (optional)</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => {
                  setForm({ ...form, website: e.target.value });
                  setWebsiteError("");
                  if (e.target.value && !validateURL(e.target.value)) {
                    setWebsiteError("Please enter a valid URL (e.g., https://example.com or example.com)");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value && !validateURL(e.target.value)) {
                    setWebsiteError("Please enter a valid URL (e.g., https://example.com or example.com)");
                  }
                }}
                placeholder="https://example.com or example.com"
                className={`w-full border border-gray bg-color-1 text-text px-4 py-2 rounded focus:outline-primary ${
                  websiteError ? "border-red-500" : ""
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">Example: https://example.com or example.com</p>
              {websiteError && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{websiteError}</span>
                </p>
              )}
            </div>

            {/* Social links */}
            {[
              { platform: "instagram", example: "https://instagram.com/yourcompany" },
              { platform: "twitter", example: "https://twitter.com/yourcompany" },
              { platform: "linkedin", example: "https://linkedin.com/company/yourcompany" }
            ].map(({ platform, example }) => (
              <Input
                key={platform}
                label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} (optional)`}
                name={platform}
                type="url"
                value={form[platform]}
                onChange={setForm}
                placeholder={example}
                example={`Example: ${example}`}
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
        return Boolean(verificationToken); // Email must be verified
      case 3:
        return Object.values(passwordRules).every(Boolean);
      case 4: {
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

          <p className="text-sm text-center text-gray-500">Step {step} of 4</p>

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
            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 2 && !verificationToken) {
                    return toast.error("Please verify your email first");
                  }
                  if (isStepValid()) {
                    setStep(step + 1);
                  } else {
                    toast.error("Please complete all fields");
                  }
                }}
                className="btn-primary px-6 text-white font-bold"
                disabled={submitting || (step === 2 && !verificationToken)}
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

function Input({ label, name, value, onChange, type = "text", placeholder, example }) {
  return (
    <div className="text-color">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange((prev) => ({ ...prev, [name]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray bg-color-1 text-text px-4 py-2 rounded focus:outline-primary"
      />
      {example && (
        <p className="text-xs text-gray-500 mt-1">{example}</p>
      )}
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
