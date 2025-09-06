import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SecretAdminGate({
  combo = { altKey: true, shiftKey: true, key: "a" }, // Alt+Shift+A by default
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      // don’t trigger while typing in inputs
      const tag = (e.target.tagName || "").toLowerCase();
      const isEditable =
        tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
      if (isEditable) return;

      const want =
        (!!combo.altKey === e.altKey) &&
        (!!combo.shiftKey === e.shiftKey) &&
        (!!combo.ctrlKey === e.ctrlKey) &&
        (!!combo.metaKey === e.metaKey) &&
        (e.key?.toLowerCase() === combo.key?.toLowerCase());

      if (want) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [combo]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel */}
      <div
        className="relative w-[92%] max-w-md rounded-xl border border-gray bg-color-1 shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 px-2 py-1 rounded-md text-gray hover:bg-color-2"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-color mb-2">Admin Access</h2>
        <p className="text-sm text-gray mb-4">
          Secret panel opened via <kbd className="px-1 py-0.5 rounded bg-color-2">Alt</kbd> +
          <kbd className="px-1 py-0.5 rounded bg-color-2">Shift</kbd> +
          <kbd className="px-1 py-0.5 rounded bg-color-2 uppercase">{combo.key}</kbd>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/auth/admin/login")}
            className="btn-primary text-color-white w-full py-2 rounded-lg font-medium"
          >
            Admin Login
          </button>

          <button
            onClick={() => navigate("/auth/admin/register")}
            className="w-full py-2 rounded-lg font-medium border border-gray text-color hover:bg-theme-highlight"
          >
            Admin Register
          </button>

                    <button
            onClick={() => navigate("forgot-password?role=admin")}
            className="w-full py-2 rounded-lg font-medium border border-gray text-color hover:bg-theme-highlight"
          >
            Admin Reset Password
          </button>
        </div>

        {/* <p className="text-xs text-gray mt-4">
          Tip: change the combo via the <code>combo</code> prop.
        </p> */}
      </div>
      
    </div>
  );
}
