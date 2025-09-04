import React from "react";
import ResetPasswordForm from "../../component/ResetPasswordForm";
import Navigation from "../../component/Navigation";
import Footer from "../../component/Footer";

export const ResetPasswordPage = () => {
  return (
    <>
    <Navigation />
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-gray-100 dark:to-gray-900 text-text px-4">
      <div className="bg-color-1 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center mb-0"><span className="color-primary">Reset</span> Password</h1>
        <p className="text-gray text-sm text-center">
          Create a new password for your account.
        </p>

        <ResetPasswordForm />

        <p className="text-xs text-center text-gray">
          Make sure your new password is strong and unique.
        </p>
      </div>
    </div>
    <Footer />
    </>
  );
};
