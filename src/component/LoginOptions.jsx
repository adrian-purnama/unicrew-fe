import { useNavigate } from "react-router-dom";

export default function LoginOptions() {
  const navigate = useNavigate();

  // const handleLogin = (role) => {
  //   navigate(`/auth/${role}/login`);
  // };

    const handleLogin = (role) => {
    navigate(`/auth/${role}/register`);
  };

  return (
    <div className="w-full max-w-xl p-8 rounded-2xl bg-background text-text shadow-xl border border-white/10 space-y-6">
      {/* <h2 className="text-3xl font-bold text-center">Login as</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => handleLogin("user")}
          className="btn-primary py-3"
        >
          Student
        </button>
        <button
          onClick={() => handleLogin("company")}
          className="btn-highlight py-3"
        >
          Company
        </button>
      </div> */}

      <h2 className="text-3xl font-bold text-center">Register Nownpm run dev</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => handleLogin("company")}
          className="btn-highlight py-3 font-bold"
        >
          Company
        </button>
        <button
          onClick={() => handleLogin("user")}
          className="btn-primary py-3 font-bold"
        >
          Student
        </button>
      </div>
    </div>
  );
}
