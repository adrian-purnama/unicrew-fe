import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/ApiHelper";


export default function ForgotPasswordForm({ role = "user" }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");
    setSending(true);
    try {
      await axiosInstance.post("/auth/forgot-password", { email, role });
      toast.success("Reset link sent. Check your inbox (and spam).");
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reset email");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-color">Email</label>
        <input
          type="email"
          value={email}
          placeholder={`your ${role} email`}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray bg-color-1 text-text px-3 py-2 rounded text-color"
        />
      </div>

      <button type="submit" disabled={sending} className="btn-primary w-full font-bold">
        {sending ? "Sending…" : "Send Reset Link"}
      </button>
    </form>
  );
}
