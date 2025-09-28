import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/ApiHelper";

export default function ReverifyEmailForm({ role = "user" }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");
    setSending(true);
    const toastId = toast.loading("Sending...");
    try {
      await axiosInstance.post("/auth/reverify", { email, role });
      toast.dismiss(toastId);
      toast.success("Verification email sent. Check your inbox (and spam).");
      setCooldown(120); // 2 minutes cooldown
      setEmail("");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.response?.data?.message || "Failed to send email");
      const hdrs = err?.response?.headers || {};
      const retry = parseInt(hdrs["retry-after"]) || parseInt(hdrs["x-ratelimit-reset"]);
      if (!Number.isNaN(retry) && retry > 0) setCooldown(retry);
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

      <button
        type="submit"
        disabled={sending || cooldown > 0}
        className="btn-primary w-full font-bold"
      >
        {sending
          ? "Sending..."
          : cooldown > 0
          ? `Wait ${formatTime(cooldown)}`
          : "Send Verification"}
      </button>

      {cooldown > 0 && (
        <p className="text-center text-xs text-gray">
          You can request again in {formatTime(cooldown)}.
        </p>
      )}
    </form>
  );
}
