import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";

export default function ReverifyEmailPage() {
  const [params] = useSearchParams();
  const role = params.get("role");

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/auth/reverify", { email, role });
      setMessage(res.data.message || "Verification email sent!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text px-4">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 shadow-xl rounded-xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center">
          Reverify{" "}
          <span className="text-primary">{role ? role.toUpperCase() : "Account"}</span> Email
        </h2>

        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-background text-text px-4 py-2 rounded focus:outline focus:outline-2 focus:outline-primary"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={!email}
        >
          Send Verification
        </button>

        {message && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </form>
    </div>
  );
}
