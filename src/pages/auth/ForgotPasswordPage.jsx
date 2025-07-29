import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ForgotPasswordForm from '../../component/ForgotPasswordForm';
import Navigation from '../../component/Navigation';
import Footer from '../../component/Footer';

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "user";

  return (
    <div className=' min-h-[90vh]'>
        <Navigation />
        <div className='shadow-2xl w-fit mx-auto mb-[5rem] rounded-md'>
            <ForgotPasswordForm role={role} />
        </div>
        {/* <Footer /> */}
    </div>
  );
};

export default ForgotPasswordPage;
