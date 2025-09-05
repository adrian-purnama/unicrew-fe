import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../utils/UserContext";
import { UserPlus, Briefcase } from "lucide-react";
import BaseModal from "./BaseModal";

export default function CTAButtons() {
  const { isLoggedIn } = useContext(UserContext);
  const [open, setOpen] = useState(false);

  return (
    <div
      role="group"
      aria-label="Call to action"
      className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6"
    >
      {/* Primary: Explore Jobs */}
      <Link
        to="/user"
        className="btn-primary px-6 sm:px-8 py-3 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        🔍 Explore Jobs
      </Link>

      {/* Secondary: Register (only when logged out) */}
      {!isLoggedIn && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-6 sm:px-8 py-3 rounded-xl border border-gray bg-color-2 text-color font-semibold shadow-sm hover:bg-primary-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
        >
          📝 Register
        </button>
      )}

      {/* Register options modal */}
      <BaseModal isOpen={open} onClose={() => setOpen(false)} title="Create an account">
        <div className="space-y-3">
          <p className="text-sm text-gray">
            Choose how you’d like to get started.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <Link
              to="/auth/company/register"
              onClick={() => setOpen(false)}
              className="group border border-gray rounded-xl p-4 bg-color-2 hover:bg-primary-20 transition-colors flex items-center gap-3"
            >
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-primary-20 text-primary">
                <Briefcase className="w-5 h-5" />
              </span>
              <div>
                <div className="font-semibold text-color">Company</div>
                <div className="text-xs text-gray">Post roles & review applicants</div>
              </div>
            </Link>

                        <Link
              to="/auth/user/register"
              onClick={() => setOpen(false)}
              className="group border border-gray rounded-xl p-4 bg-color-2 hover:bg-primary-20 transition-colors flex items-center gap-3"
            >
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-primary-20 text-primary">
                <UserPlus className="w-5 h-5" />
              </span>
              <div>
                <div className="font-semibold text-color">Student</div>
                <div className="text-xs text-gray">Find jobs & build your profile</div>
              </div>
            </Link>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray text-color hover:bg-color-1 transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </BaseModal>
    </div>
  );
}
