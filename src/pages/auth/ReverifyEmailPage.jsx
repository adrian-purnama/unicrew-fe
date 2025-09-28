import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ReverifyEmailForm from "../../component/ReverifyEmailForm";

export default function ReverifyEmailPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = (searchParams.get("role") || "user").toLowerCase();
  const role = useMemo(
    () => (["user", "company", "admin"].includes(roleParam) ? roleParam : "user"),
    [roleParam]
  );

  const setRole = (next) => {
    const sp = new URLSearchParams(searchParams);
    sp.set("role", next);
    setSearchParams(sp, { replace: true });
  };

  const SWITCHABLE_ROLES = ["user", "company"]; // show toggle buttons like ForgotPasswordPage
  const showSwitcher = role !== "admin"; // hide switcher if admin is explicitly set

  return (
    <div className="min-h-screen flex items-center bg-color-1 justify-center text-text px-4">
      <div className="p-8 bg-color-2 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-color">
            <span className="color-primary">Reverify</span> Email
          </h1>

          {showSwitcher && (
            <div className="flex items-center justify-center gap-2">
              {SWITCHABLE_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    role === r
                      ? "bg-primary text-color border-primary"
                      : "bg-color-1 border-gray text-color"
                  }`}
                >
                  {r === "user" ? "User" : "Company"}
                </button>
              ))}
            </div>
          )}

          <p className="text-gray text-sm">Send a fresh verification email ({role}).</p>
        </div>

        {/* Pass the resolved role (user/company/admin) */}
        <ReverifyEmailForm role={role} />

        <p className="text-xs text-center text-gray">
          Don't forget to check your <span className="color-primary font-bold">Spam</span> or{" "}
          <span className="color-primary font-bold">Junk</span> folder.
        </p>
      </div>
    </div>
  );
}
