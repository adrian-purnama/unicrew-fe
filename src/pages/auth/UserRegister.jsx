// UserRegister.jsx — fixed keys & payload
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Check } from "lucide-react";
import Navigation from "../../component/Navigation";
import CustomSelect from "../../component/CustomSelect";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DatePickerYMD from "../../component/DatePickerYMD";

export default function UserRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    universityId: "",     // ✅ keep IDs here
    studyProgramId: "",   // ✅ keep IDs here
    externalSystemId: "",
    acceptedTerms: false,
  });


  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
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

  // Cooldown timer for resend code
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    const { password, confirmPassword } = form;
    setPasswordRules({
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
      match: password === confirmPassword && password.length > 0,
    });
  }, [form.password, form.confirmPassword]);

  const handleSendCode = async () => {
    if (!form.email) {
      return toast.error("Please enter your email first");
    }
    if (!form.email.endsWith(".ac.id") && !form.email.endsWith(".edu")) {
      return toast.error("Email must end with .ac.id or .edu");
    }

    setSendingCode(true);
    try {
      await axiosInstance.post("/register/send-verification-code", {
        email: form.email,
        role: "user",
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
        role: "user",
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
    if (!form.email.endsWith(".ac.id") && !form.email.endsWith(".edu")) {
      return toast.error("Email must end with .ac.id or .edu");
    }
    if (!length || !number || !symbol || !match) {
      return toast.error("Please fix password requirements");
    }

    const payload = {
      fullName: form.fullName,
      birthDate: form.birthDate,
      email: form.email,
      password: form.password,
      externalSystemId: form.externalSystemId,
      universityId: form.universityId,
      studyProgramId: form.studyProgramId,
      verificationToken,
    };

    const extractErr = (err) =>
      err?.response?.data?.message || err?.message || "Registration failed";

    try {
      const req = axiosInstance.post("/register/user", payload);
      const res = await toast.promise(
        req,
        {
          loading: "Creating your account…",
          success: "Account created successfully! 🎉",
          error: (err) => extractErr(err),
        },
        {
          success: { duration: 4000 },
          error: { duration: 5000 },
        }
      );

      const { token } = res.data || {};
      if (token) localStorage.setItem("unicru-token", token);
      setTimeout(() => {
        window.location.href = `/user`;
      }, 1000);
    } catch (err) {
      console.log(err)
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Input 
              label="Full Name" 
              name="fullName" 
              value={form.fullName} 
              onChange={setForm}
              placeholder="e.g., John Doe"
              example="Example: John Doe"
            />
            <Input 
              label="Email (.ac.id / .edu)" 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={setForm}
              placeholder="e.g., john.doe@university.ac.id"
              example="Example: john.doe@university.ac.id or john.doe@university.edu"
            />
            <p className="text-color font-bold mb-1">Birthday</p>
            <DatePickerYMD
              value={form.birthDate || ""}
              onChange={(iso) => setForm((prev) => ({ ...prev, birthDate: iso }))}
              maxDate={new Date()}                               // no future dates
              minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))} // last 100 yrs
              placeholder="Select your birth date"
              className="w-full"
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
                  className="w-full border px-4 py-2 rounded pr-10 focus:outline-primary bg-background text-text"
                />
                <button type="button" className="absolute right-2 top-2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
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
            <Input 
              label="External System ID (NIM)" 
              name="externalSystemId" 
              value={form.externalSystemId} 
              onChange={setForm}
              placeholder="e.g., 1234567890"
              example="Example: 1234567890 (Your student ID number)"
            />
            {/* ✅ Bind selects to ID fields the API expects */}
            <CustomSelect
              label="Select University"
              endpoint="/admin/university"
              value={form.universityId}
              onChange={(val) => setForm({ ...form, universityId: val?.value || "" })}
            />
            <CustomSelect
              label="Select Study Program"
              endpoint="/admin/study-program"
              value={form.studyProgramId}
              onChange={(val) => setForm({ ...form, studyProgramId: val?.value || "" })}
            />
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
        return Boolean(form.fullName && form.birthDate && form.email);
      case 2:
        return Boolean(verificationToken); // Email must be verified
      case 3:
        return Object.values(passwordRules).every(Boolean);
      case 4:
        // ✅ validate IDs not old keys
        return Boolean(form.externalSystemId && form.universityId && form.studyProgramId && form.acceptedTerms);
      default:
        return false;
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background text-text px-4 py-[4rem] bg-color-1">
        <Toaster />
        <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-color-2 shadow-xl rounded-xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-color">
            Register as <span className="color-primary">Student</span>
          </h2>
          <p className="text-sm text-center text-gray-500">Step {step} of 4</p>
          {renderStep()}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 border rounded text-sm">
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
                disabled={step === 2 && !verificationToken}
              >
                Next
              </button>
            ) : (
              <button type="submit" className="btn-primary px-6 text-white font-bold" disabled={!isStepValid()}>
                Register
              </button>
            )}
          </div>

          <div className="text-center text-sm">
            <a href={`/auth/user/login`} className="text-sm text-primary hover:underline">Login</a>
            <span className="mx-2 text-color">or</span>
            <a href={`/forgot-password?role=user`} className="text-sm text-primary hover:underline">Forgot password?</a>
          </div>
        </form>
      </div>
    </>
  );
}

function Input({ label, name, type = "text", value, onChange, placeholder, example }) {
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

function Requirement({ met, children }) {
  return (
    <div className="flex items-center gap-2">
      <Check className={`w-4 h-4 ${met ? "text-green-500" : "text-gray-400"}`} />
      <span>{children}</span>
    </div>
  );
}
