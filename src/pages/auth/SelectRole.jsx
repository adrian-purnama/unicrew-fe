import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectRole() {
  const [mode, setMode] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (!mode) return;
    if (mode === 'verify') {
      navigate(`/reverify?role=${role}`);
    } else {
      navigate(`/auth/${role}/${mode}`);
    }
  };

  return (
    <div className="w-full max-w-lg p-6 rounded-xl bg-background text-text shadow-lg backdrop-blur border border-white/10 space-y-4">
      {!mode ? (
        <>
          <h2 className="text-2xl font-bold text-center">Temp ez login</h2>
          <div className="grid gap-3">
            <button onClick={() => setMode('login')} className="btn-primary">
              Login
            </button>
            <button onClick={() => setMode('register')} className="btn-primary bg-green-500 hover:bg-green-600">
              Register
            </button>
            <button onClick={() => setMode('verify')} className="btn-primary bg-yellow-500 hover:bg-yellow-600 text-black">
              Verify Email
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-center capitalize">Select Your Role to {mode}</h2>
          <div className="grid gap-3">
            <button onClick={() => handleRoleSelect('admin')} className="btn-primary bg-blue-600 hover:bg-blue-700">
              Admin
            </button>
            <button onClick={() => handleRoleSelect('user')} className="btn-primary bg-green-600 hover:bg-green-700">
              Student / User
            </button>
            <button onClick={() => handleRoleSelect('company')} className="btn-primary bg-purple-600 hover:bg-purple-700">
              Company / Employer
            </button>
            <button onClick={() => setMode(null)} className="text-sm text-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ← Go Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
