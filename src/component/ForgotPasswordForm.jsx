import { useState } from "react";
import axiosInstance from "../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordForm({ role }) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/forgot-password", { email, role });
      toast.success("Reset link has been sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-10">
      <Toaster />
      <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full border rounded px-4 py-2"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn-primary w-full" type="submit">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
