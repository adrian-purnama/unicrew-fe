import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../../utils/ApiHelper";
import toast, { Toaster } from "react-hot-toast";
import Navigation from "../../component/Navigation";
import Footer from "../../component/Footer";

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
      toast.success("Verification email sent!");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <Navigation />
    <div className="min-h-screen flex items-center justify-center bg-color-1 text-text px-4">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="bg-color-2 shadow-lg rounded-xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-color">
          <span className="text-primary">
            Reverify
          </span> Email
        </h2>

        <div>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray text-color text-text px-4 py-2 rounded bg-color-1 focus:outline-primary"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full font-bold text-color" disabled={!email}>
          Send Verification
        </button>
        <p className="text-xs text-center text-gray">
          Dont forget to chek your <span className="color-primary font-bold">Spamm</span> or <span className="color-primary font-bold">Junk</span>
        </p>

        {message && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">{message}</p>
        )}
      </form>
    </div>
    <Footer />
    </>
  );
}
