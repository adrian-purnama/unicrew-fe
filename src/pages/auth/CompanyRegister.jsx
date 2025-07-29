import { useState, useEffect } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import Navigation from "../../component/Navigation";
import { Eye, EyeOff, Check } from "lucide-react";

export default function CompanyRegister() {
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    industries: [],
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    acceptedTerms: false,
  });

  const [industryOptions, setIndustryOptions] = useState([]);
  const [provinsiOptions, setProvinsiOptions] = useState([]);
  const [kabupatenOptions, setKabupatenOptions] = useState([]);
  const [kecamatanOptions, setKecamatanOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    number: false,
    symbol: false,
    match: false,
  });

  useEffect(() => {
    axiosInstance.get("/admin/industry").then((res) => setIndustryOptions(res.data));
    axiosInstance.get("/admin/provinsi").then((res) => setProvinsiOptions(res.data));
  }, []);

  useEffect(() => {
    if (form.provinsi) {
      axiosInstance.get("/admin/kabupaten", { params: { provinsi: form.provinsi } })
        .then((res) => setKabupatenOptions(res.data));
    } else {
      setKabupatenOptions([]);
    }
    setForm((prev) => ({ ...prev, kabupaten: "", kecamatan: "" }));
  }, [form.provinsi]);

  useEffect(() => {
    if (form.kabupaten) {
      axiosInstance.get("/admin/kecamatan", { params: { kabupaten: form.kabupaten } })
        .then((res) => setKecamatanOptions(res.data));
    } else {
      setKecamatanOptions([]);
    }
    setForm((prev) => ({ ...prev, kecamatan: "" }));
  }, [form.kabupaten]);

  useEffect(() => {
    const { password, confirmPassword } = form;
    const rules = {
      length: password.length >= 8,
      number: /\d/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
      match: password === confirmPassword && password.length > 0,
    };
    setPasswordRules(rules);
  }, [form.password, form.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { length, number, symbol, match } = passwordRules;

    if (!form.acceptedTerms) return toast.error("You must accept terms and privacy policy.");
    if (!length || !number || !symbol || !match) {
      return toast.error("Please fix password requirements");
    }

    const payload = {
      companyName: form.companyName,
      email: form.email,
      password: form.password,
      description: form.description,
      industries: form.industries,
      location: {
        provinsi: form.provinsi,
        kabupaten: form.kabupaten,
        kecamatan: form.kecamatan,
      },
      socialLinks: {
        website: form.website,
        instagram: form.instagram,
        twitter: form.twitter,
        linkedin: form.linkedin,
      },
    };

    try {
      await axiosInstance.post("/register/company", payload);
      toast.success("Company registered. Check your email to verify.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-background text-text px-4 py-12 bg-color-1">
        <Toaster position="top-center" />
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 shadow-lg p-8 rounded-xl w-full max-w-2xl space-y-6"
        >
          <h2 className="text-3xl font-bold text-center text-color">
            Register as <span className="color-primary">Company</span>
          </h2>

          {["companyName", "email"].map((field) => (
            <div className="text-color" key={field}>
              <label className="block font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type={field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
              />
            </div>
          ))}

          <div className="text-color">
            <label className="block font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 pr-10 rounded focus:outline focus:outline-2 focus:outline-primary"
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

          <div className="text-color">
            <label className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
            />
          </div>

          <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {passwordRules.length && <Check className="text-green-500 w-4 h-4" />}<span>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRules.symbol && <Check className="text-green-500 w-4 h-4" />}<span>At least 1 special character</span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRules.number && <Check className="text-green-500 w-4 h-4" />}<span>At least 1 number</span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRules.match && <Check className="text-green-500 w-4 h-4" />}<span>Passwords match</span>
            </div>
          </div>

          <div className="text-color">
            <label className="block font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
            />
          </div>

          <div className="text-color">
            <label className="block font-medium mb-1">Industries (select up to 3)</label>
            <select
              multiple
              value={form.industries}
              onChange={(e) =>
                setForm({
                  ...form,
                  industries: Array.from(e.target.selectedOptions, (opt) => opt.value).slice(0, 3),
                })
              }
              className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
            >
              {industryOptions.map((ind) => (
                <option key={ind._id} value={ind._id}>{ind.name}</option>
              ))}
            </select>
          </div>

          {["provinsi", "kabupaten", "kecamatan"].map((loc) => (
            <div className="text-color" key={loc}>
              <label className="block font-medium mb-1 capitalize">{loc}</label>
              <select
                className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
                value={form[loc]}
                onChange={(e) => setForm({ ...form, [loc]: e.target.value })}
                disabled={loc !== "provinsi" && !form[loc === "kabupaten" ? "provinsi" : "kabupaten"]}
              >
                <option value="">Select {loc}</option>
                {(loc === "provinsi"
                  ? provinsiOptions
                  : loc === "kabupaten"
                  ? kabupatenOptions
                  : kecamatanOptions).map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>
          ))}

          {["website", "instagram", "twitter", "linkedin"].map((platform) => (
            <div className="text-color" key={platform}>
              <label className="block font-medium mb-1 capitalize">{platform} {platform === "website" && "(optional)"}</label>
              <input
                type="url"
                placeholder={`Enter ${platform} URL`}
                value={form[platform]}
                onChange={(e) => setForm({ ...form, [platform]: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
              />
            </div>
          ))}

          <div className="flex items-start gap-2 text-sm text-color">
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
              !form.companyName ||
              !form.email ||
              !form.password ||
              !form.confirmPassword ||
              !form.industries.length ||
              !form.provinsi ||
              !form.kabupaten ||
              !form.kecamatan ||
              !form.acceptedTerms ||
              Object.values(passwordRules).includes(false)
            }
            className="btn-primary w-full font-bold text-white"
          >
            Register Company
          </button>
        </form>
      </div>
    </>
  );
}
