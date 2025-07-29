import React from "react";
import ResetPasswordForm from "../../component/ResetPasswordFOrm";
import Navigation from "../../component/Navigation";


export const ResetPasswordPage = () => {
    return (
        <div>
            <Navigation />
            <div className="shadow-2xl w-fit mx-auto rounded-md px-10">
                <ResetPasswordForm />
            </div>
        </div>
    );
};
