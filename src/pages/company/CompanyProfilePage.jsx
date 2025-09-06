import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import IndustrySelector from "../../component/IndustrySelector";
import ProfilePictureUploader from "../../component/ProfilePictureUploader";
import LocationSelector from "../../component/LocationSelector";
import BaseModal from "../../component/BaseModal";
import Navigation from "../../component/Navigation";
import toast from "react-hot-toast";

const CompanyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const savedHashRef = useRef("");
  const allowExitRef = useRef(false);

  // ----- dirty-state helpers -----
  const normalizeForm = (f) =>
    JSON.stringify({
      companyName: f?.companyName || "",
      description: f?.description || "",
      industries: (f?.industries || []).map((i) => i?.value ?? i).sort(),
      location: {
        provinsi: f?.location?.provinsi || "",
        kabupaten: f?.location?.kabupaten || "",
        kecamatan: f?.location?.kecamatan || "",
      },
      socialLinks: {
        website: f?.socialLinks?.website || "",
        linkedin: f?.socialLinks?.linkedin || "",
        twitter: f?.socialLinks?.twitter || "",
        instagram: f?.socialLinks?.instagram || "",
      },
      hasLogoFile: f?.profilePicture instanceof File,
    });

  const updateDirty = (next) => {
    const hash = normalizeForm(next);
    setIsDirty(hash !== savedHashRef.current);
  };

  // ----- initial fetch -----
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: company } = await axiosInstance.get("/company/profile");
        setProfile(company);

        // Build form ONLY with editable primitives; don't seed asset fields with URLs
        const nextForm = {
          companyName: company.companyName || "",
          description: company.description || "",
          industries: (company.industries || []).map((i) => ({
            value: i._id || i,
            label: i.name || "",
          })),
          location: {
            provinsi: company.location?.provinsi?._id || company.location?.provinsi || "",
            kabupaten: company.location?.kabupaten?._id || company.location?.kabupaten || "",
            kecamatan: company.location?.kecamatan?._id || company.location?.kecamatan || "",
          },
          socialLinks: {
            website: company.socialLinks?.website || "",
            linkedin: company.socialLinks?.linkedin || "",
            twitter: company.socialLinks?.twitter || "",
            instagram: company.socialLinks?.instagram || "",
          },
          profilePicture: undefined, // logo file goes here on replace
        };

        setForm(nextForm);
        savedHashRef.current = normalizeForm(nextForm);
        setIsDirty(false);
      } catch {
        toast.error("Failed to load company profile");
      }
    };
    fetchData();
  }, []);

  // ----- handlers -----
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      const next = { ...form, location: { ...form.location, [key]: value } };
      setForm(next);
      updateDirty(next);
      return;
    }

    if (["website", "linkedin", "twitter", "instagram"].includes(name)) {
      const next = { ...form, socialLinks: { ...form.socialLinks, [name]: value } };
      setForm(next);
      updateDirty(next);
      return;
    }

    const next = { ...form, [name]: value };
    setForm(next);
    updateDirty(next);
  };

  const handleLogoChange = (file) => {
    const next = { ...form, profilePicture: file }; // File object only
    setForm(next);
    updateDirty(next);
  };

  // Optionally refresh only the logo URL after save (if you return a temp link)
  const refreshProfile = async () => {
    try {
      const { data: fresh } = await axiosInstance.get("/company/profile");
      setProfile(fresh); // this preserves form edits
      toast.success("Logo link refreshed");
    } catch {
      toast.error("Failed to refresh profile");
    }
  };

  // ----- submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    if (form.companyName) fd.append("companyName", form.companyName);
    if (form.description) fd.append("description", form.description);

    // Append ONLY real files; never append existing URL strings
    if (form.profilePicture instanceof File) fd.append("profilePicture", form.profilePicture);

    if (form.industries?.length) {
      form.industries.forEach((i) => fd.append("industries", i.value));
    }

    Object.entries(form.location || {}).forEach(([k, v]) => {
      if (v) fd.append(`location[${k}]`, v);
    });

    ["website", "linkedin", "twitter", "instagram"].forEach((key) => {
      const val = form.socialLinks?.[key];
      if (val) fd.append(`socialLinks[${key}]`, val);
    });

    const toastId = toast.loading("Updating company profile...");
    try {
      await axiosInstance.patch("/company/profile", fd);
      toast.success("Company profile updated", { id: toastId });

      await refreshProfile(); // get fresh logo URL after save

      savedHashRef.current = normalizeForm(form);
      setIsDirty(false);
    } catch {
      toast.error("Failed to update company profile", { id: toastId });
    }
  };

  // ----- leave guards -----
  useEffect(() => {
    const beforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const push = () => {
      try {
        window.history.pushState({ _companyProfileGuard: true }, "");
      } catch {}
    };
    push();

    const onPopState = () => {
      if (isDirty && !allowExitRef.current) {
        setShowExitModal(true);
        push();
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isDirty]);

  const confirmExitWithoutSaving = () => {
    allowExitRef.current = true;
    setShowExitModal(false);
    setIsDirty(false);
    try {
      window.history.back();
    } catch {
      window.location.href = "/";
    }
  };

  const cancelExit = () => setShowExitModal(false);

  if (!profile) return <p className="p-6 text-center text-color">Loading...</p>;

  return (
    <>

      <main className="min-h-screen bg-color-1">
        {/* Page header (same style as user page) */}
        <section className="border border-gray border-l-0 border-r-0 bg-color-2 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight text-color">Company Profile</h1>
            <p className="mt-1 text-sm text-gray">
              Keep your company information up to date for better candidate engagement.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
            {/* Brand Identity + Logo */}
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-color">Brand Identity</h2>
                  <p className="text-sm text-gray">Your company name and logo.</p>
                </div>

                <ProfilePictureUploader
                  initialUrl={profile.profilePicture /* temp URL from backend */}
                  onChange={handleLogoChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium block mb-1 text-color">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray bg-color-1 text-color px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    name="companyName"
                    value={form.companyName || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="font-medium block mb-1 text-color">Website</label>
                  <input
                    className="w-full rounded-lg border border-gray bg-color-1 text-color px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    name="website"
                    value={form.socialLinks?.website || ""}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </section>

            <hr className="border-gray" />

            {/* About */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-color">About</h2>
                <p className="text-sm text-gray">Describe your company’s mission and culture.</p>
              </div>

              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                className="w-full h-32 rounded-lg border border-gray bg-color-1 text-color px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
              />
            </section>

            <hr className="border-gray" />

            {/* Industries & Location */}
            <section className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-color">Industries</h2>
                  <IndustrySelector
                    value={form.industries || []}
                    onChange={(industries) => {
                      const next = { ...form, industries };
                      setForm(next);
                      updateDirty(next);
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-color">Location</h2>
                  <LocationSelector
                    value={form.location}
                    onChange={(location) => {
                      const next = { ...form, location };
                      setForm(next);
                      updateDirty(next);
                    }}
                  />
                </div>
              </div>
            </section>

            <hr className="border-gray" />

            {/* Social Links */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-color">Social Links</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["linkedin", "twitter", "instagram"].map((platform) => (
                  <div key={platform}>
                    <label className="font-medium block mb-1 text-color capitalize">
                      {platform}
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray bg-color-1 text-color px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                      name={platform}
                      value={form.socialLinks?.[platform] || ""}
                      onChange={handleChange}
                      placeholder={
                        platform === "linkedin"
                          ? "https://linkedin.com/company/your-handle"
                          : platform === "twitter"
                          ? "https://x.com/your-handle"
                          : "https://instagram.com/your-handle"
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* bottom spacer for sticky bar */}
            <div className="h-24" />
          </div>

          {/* Sticky Save Bar (same as user page) */}
          <div className="fixed inset-x-0 bottom-0 z-50">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="mb-4 rounded-xl border border-gray bg-color-1 backdrop-blur shadow-lg">
                <div className="flex items-center justify-between gap-4 p-3">
                  <p className="text-sm text-gray">Review your changes and save.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isDirty) setShowExitModal(true);
                        else window.history.back();
                      }}
                      className="px-4 py-2 rounded-lg border border-gray text-color hover:bg-theme-highlight"
                    >
                      Exit
                    </button>
                    <button
                      type="submit"
                      className="btn-primary px-5 py-2 font-semibold text-color-white rounded-lg"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Exit without saving modal */}
      <BaseModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title="Discard unsaved changes?">
        <p className="text-sm text-color">
          You have unsaved changes. Are you sure you want to leave without saving?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setShowExitModal(false)} className="px-4 py-2 rounded-lg border border-gray text-color">
            Stay
          </button>
          <button onClick={confirmExitWithoutSaving} className="px-4 py-2 rounded-lg btn-highlight text-color-white">
            Discard &amp; Leave
          </button>
        </div>
      </BaseModal>
    </>
  );
};

export default CompanyProfilePage;
