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
    };

    const extractErr = (err) =>
      err?.response?.data?.message || err?.message || "Registration failed";

    try {
      const req = axiosInstance.post("/register/user", payload);
      const res = await toast.promise(
        req,
        {
          loading: "Creating your account…",
          success: "check your email to verify ✉️",
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
            <Input label="Full Name" name="fullName" value={form.fullName} onChange={setForm} />
            <Input label="Email (.ac.id / .edu)" name="email" type="email" value={form.email} onChange={setForm} />
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
              <label className="block mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border px-4 py-2 rounded pr-10 focus:outline-primary bg-background text-text"
                />
                <button type="button" className="absolute right-2 top-2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Input label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={setForm} />
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
            <Input label="External System ID (NIM)" name="externalSystemId" value={form.externalSystemId} onChange={setForm} />
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
        return Object.values(passwordRules).every(Boolean);
      case 3:
        // ✅ validate IDs not old keys
        return Boolean(form.externalSystemId && form.universityId && form.studyProgramId && form.acceptedTerms);
      default:
        return false;
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-background text-text px-4 py-[4rem] bg-color-1">
        <Toaster />
        <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-color-2 shadow-xl rounded-xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-color">
            Register as <span className="color-primary">Student</span>
          </h2>
          <p className="text-sm text-center text-gray-500">Step {step} of 3</p>
          {renderStep()}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 border rounded text-sm">
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => (isStepValid() ? setStep(step + 1) : toast.error("Please complete all fields"))}
                className="btn-primary px-6 text-white font-bold"
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

function Input({ label, name, type = "text", value, onChange }) {
  return (
    <div className="text-color">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange((prev) => ({ ...prev, [name]: e.target.value }))}
        className="w-full border border-gray bg-color-1 text-text px-4 py-2 rounded"
      />
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
