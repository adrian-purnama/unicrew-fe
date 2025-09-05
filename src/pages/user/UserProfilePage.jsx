import { useContext, useEffect, useRef, useState } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import { UserContext } from "../../../utils/UserContext";
import ProfilePictureUploader from "../../component/ProfilePictureUploader";
import SkillSelector from "../../component/SkillSelector";
import toast from "react-hot-toast";
import Navigation from "../../component/Navigation";
import LocationSelector from "../../component/LocationSelector";
import BaseModal from "../../component/BaseModal";
import { useNavigate } from "react-router-dom";
import SkillComposer from "../../component/SkillComposer";

const UserProfilePage = () => {
  const { profilePicture } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const savedHashRef = useRef("");
  const allowExitRef = useRef(false);

  const navigate = useNavigate()

  // ---- helpers for dirty-state tracking ----
  const normalizeForm = (f) =>
    JSON.stringify({
      fullName: f?.fullName || "",
      aboutMe: f?.aboutMe || "",
      skills: (f?.skills || []).map((s) => s?.value ?? s).sort(),
      location: {
        provinsi: f?.location?.provinsi || "",
        kabupaten: f?.location?.kabupaten || "",
        kecamatan: f?.location?.kecamatan || "",
      },
      hasProfilePictureFile: f?.profilePicture instanceof File,
      hasCvFile: f?.cv instanceof File,
      hasPortfolioFile: f?.portfolio instanceof File,
    });

  const updateDirty = (next) => {
    const hash = normalizeForm(next);
    setIsDirty(hash !== savedHashRef.current);
  };

  // ---- initial data ----
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: user } = await axiosInstance.get("/user/profile");
        setProfile(user);
        console.log(user)

        // Build form ONLY with editable primitives (do NOT seed asset fields)
        const nextForm = {
          fullName: user.fullName || "",
          aboutMe: user.aboutMe || "",
          skills: (user.skills || []).map((s) => ({
            value: s._id || s,
            label: s.name || "",
            usageCount: typeof s.usageCount === "number" ? s.usageCount : 0, // keep count
          })),

          location: {
            provinsi: user.location?.provinsi?._id || user.location?.provinsi || "",
            kabupaten: user.location?.kabupaten?._id || user.location?.kabupaten || "",
            kecamatan: user.location?.kecamatan?._id || user.location?.kecamatan || "",
          },
          // important: leave file fields undefined until the user picks a file
          profilePicture: undefined,
          cv: undefined,
          portfolio: undefined,
        };

        setForm(nextForm);
        savedHashRef.current = normalizeForm(nextForm);
        setIsDirty(false);
      } catch {
        toast.error("Failed to load profile data");
      }
    };
    fetchInitialData();
  }, []);

  // ---- input handlers ----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name.startsWith("location.")) {
        const key = name.split(".")[1];
        const next = { ...prev, location: { ...prev.location, [key]: value } };
        updateDirty(next);
        return next;
      }
      const next = { ...prev, [name]: value };
      updateDirty(next);
      return next;
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    setForm((prev) => {
      const next = { ...prev, [name]: file }; // name is "cv" or "portfolio"
      updateDirty(next);
      return next;
    });
  };

  const handleProfilePictureChange = (file) => {
    setForm((prev) => {
      const next = { ...prev, profilePicture: file }; // File object only
      updateDirty(next);
      return next;
    });
  };

  // ---- submit ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (form.aboutMe) formData.append("aboutMe", form.aboutMe);
    if (form.fullName) formData.append("fullName", form.fullName);
    if (form.skills?.length) form.skills.forEach((s) => formData.append("skills", s.value));

    // Append ONLY real files; never append existing URL/ObjectId strings
    if (form.profilePicture instanceof File) formData.append("profilePicture", form.profilePicture);
    if (form.cv instanceof File) formData.append("cv", form.cv);
    if (form.portfolio instanceof File) formData.append("portfolio", form.portfolio);

    Object.entries(form.location || {}).forEach(([key, val]) => {
      if (val) formData.append(`location[${key}]`, val);
    });

    const toastId = toast.loading("Updating profile...");
    try {
      await axiosInstance.patch("/user/profile", formData);
      toast.success("Profile updated", { id: toastId });
      savedHashRef.current = normalizeForm(form);
      setIsDirty(false);
      // Optionally refetch to refresh preview links
      // const { data: fresh } = await axiosInstance.get("/user/profile");
      // setProfile(fresh);
    } catch {
      toast.error("Failed to update profile", { id: toastId });
    }
  };

  // ---- guard: native prompt on refresh/close ----
  useEffect(() => {
    const beforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);

  // ---- guard: intercept browser Back with modal ----
  useEffect(() => {
    const push = () => {
      try {
        window.history.pushState({ _profileGuard: true }, "");
      } catch { }
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

  // Prefer URL fields if backend provides them; fallback to legacy strings
  const currentCvUrl = profile.curriculumVitaeUrl || profile.curriculumVitae || "";
  const currentPortfolioUrl = profile.portfolioUrl || profile.portfolio || "";

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-color-1">
        {/* Page header */}
        <section className="border border-gray border-l-0 border-r-0 bg-color-2 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold tracking-tight text-color">Your Profile</h1>
            <p className="mt-1 text-sm text-gray">
              Keep your information up to date to get better job matches.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
            {/* Identity + avatar */}
            <section className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-color">Identity</h2>
                  <p className="text-sm text-gray">Your public name and profile picture.</p>
                </div>

                <ProfilePictureUploader
                  initialUrl={profilePicture}
                  onChange={handleProfilePictureChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium block mb-1 text-color">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray bg-color-1 text-color px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                    name="fullName"
                    value={form.fullName || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="font-medium block mb-1 text-color">Email (read-only)</label>
                  <input
                    className="w-full rounded-lg border border-gray bg-color-2 text-color px-3 py-2"
                    value={profile.email}
                    disabled
                  />
                </div>
              </div>
            </section>

            <hr className="border-gray" />

            {/* About */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-color">About</h2>
                <p className="text-sm text-gray">Tell companies a bit about yourself.</p>
              </div>

              <textarea
                name="aboutMe"
                value={form.aboutMe || ""}
                onChange={handleChange}
                className="w-full h-32 rounded-lg border border-gray bg-color-1 text-color px-3 py-2 outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
              />
            </section>

            <hr className="border-gray" />

            {/* Skills & Location */}
            <section className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-color">Skills</h2>
                  <SkillComposer
                    value={form.skills || []}
                    onChange={(skills) => {
                      const next = { ...form, skills };
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

            {/* Files */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-color">Files</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium block mb-1 text-color">CV</label>
                  <input
                    type="file"
                    name="cv"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-color file:mr-4 file:rounded-md file:border-0 file:bg-[rgb(var(--color-bg-2))] file:px-3 file:py-2 file:text-color"
                  />
                  {(currentCvUrl) && (
                    <div className="mt-2">
                      <a
                        href={currentCvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        📄 View current CV
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-medium block mb-1 text-color">Portfolio</label>
                  <input
                    type="file"
                    name="portfolio"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-color file:mr-4 file:rounded-md file:border-0 file:bg-[rgb(var(--color-bg-2))] file:px-3 file:py-2 file:text-color"
                  />
                  {(currentPortfolioUrl) && (
                    <div className="mt-2">
                      <a
                        href={currentPortfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        🎨 View current Portfolio
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* bottom spacer for sticky bar */}
            <div className="h-24" />
          </div>

          {/* Sticky Save Bar */}
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
                        else navigate("/user")
                      }}
                      className="px-4 py-2 rounded-lg border border-gray text-color hover:bg-theme-highlight"
                    >
                      Exit
                    </button>
                    <button type="submit" className="btn-primary px-5 py-2 font-semibold text-color-white rounded-lg">
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Unsaved changes modal */}
      <BaseModal isOpen={showExitModal} onClose={cancelExit} title="Discard unsaved changes?">
        <p className="text-sm text-color">You have unsaved changes. Are you sure you want to leave without saving?</p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={cancelExit} className="px-4 py-2 rounded-lg border border-gray text-color">
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

export default UserProfilePage;
