import React from "react";
import { useSearchParams } from "react-router-dom";
import ForgotPasswordForm from "../../component/ForgotPasswordForm";
import Navigation from "../../component/Navigation";
import Footer from "../../component/Footer";

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "user";

  return (
    <>
    <div className="min-h-screen flex items-center bg-color-1 justify-center text-text px-4">
      <div className="p-8 bg-color-2 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-color"><span className="color-primary">Forgot</span> Password</h1>
          <p className="text-gray text-sm">
            Enter your email to receive a reset link ({role}).
          </p>
        </div>

        <ForgotPasswordForm role={role} />

        <p className="text-xs text-center text-gray">
          Dont forget to chek your <span className="color-primary font-bold">Spamm</span> or <span className="color-primary font-bold">Junk</span>
        </p>
      </div>
    </div>
    </>
  );
};

export default ForgotPasswordPage;
