import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import { Toaster } from "react-hot-toast";
import { useContext, useEffect } from "react";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import UserLogin from "./pages/auth/UserLogin";
import UserRegister from "./pages/auth/UserRegister";
import CompanyLogin from "./pages/auth/CompanyLogin";
import CompanyRegister from "./pages/auth/CompanyRegister";
import VerifyPage from "./pages/auth/VerifyPage";
import axiosInstance from "../utils/ApiHelper";
import { UserContext } from "../utils/UserContext";
import AdminDataEntryPage from "./pages/admin/AdminDataEntryPage";
import UserHomePage from "./pages/user/UserHomePage";
import AdminHomePage from "./pages/admin/AdminHomePage";
import CompanyHomePage from "./pages/company/CompanyHomePage";
import UserProfilePage from "./pages/user/UserProfilePage";
import ReverifyEmailPage from "./pages/auth/ReverifyEmailPage";
import CompanyProfilePage from "./pages/company/CompanyProfilePage";
import CompanyJobDetailPage from "./pages/company/CompanyJobDetailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import AdminUsersPage from "./pages/admin/AdminUserPage";
import AdminCompaniesPage from "./pages/admin/AdminCompaniesPages";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";

function App() {
    const {
        setUsername,
        setRole,
        setProfilePicture,
        setIsLoggedIn,
        setIsProfileComplete,
        setNotifications,
        setId,
    } = useContext(UserContext);

      useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');

    const apply = () => {
      const t = localStorage.getItem('theme') || 'system';
      const root = document.documentElement;

      root.classList.remove('dark', 'theme-system');

      if (t === 'dark') {
        root.classList.add('dark');
      } else if (t === 'system') {
        root.classList.add('theme-system');
        if (mql?.matches) root.classList.add('dark');
      }

      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) {
        meta.setAttribute(
          'content',
          (t === 'dark' || (t === 'system' && mql?.matches)) ? 'dark light' : 'light dark'
        );
      }
    };

    // React to OS changes only when in "system"
    const onMQ = () => {
      if ((localStorage.getItem('theme') || 'system') === 'system') apply();
    };

    // React to theme changes from anywhere in the app
    const onThemeChange = () => apply();

    // React to changes from other tabs/windows
    const onStorage = (e) => {
      if (e.key === 'theme') apply();
    };

    apply();
    mql?.addEventListener?.('change', onMQ);
    window.addEventListener('theme-change', onThemeChange);
    window.addEventListener('storage', onStorage);

    return () => {
      mql?.removeEventListener?.('change', onMQ);
      window.removeEventListener('theme-change', onThemeChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem("unicru-token");
            if (!token) return;

            try {
                const res = await axiosInstance.get("/auth/authenticate", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const { name, role, profilePicture, isProfileComplete, _id } = res.data;
                console.log(res.data, res.message)
                setUsername(name);
                setRole(role);
                setProfilePicture(profilePicture);
                setIsLoggedIn(true);
                setIsProfileComplete(isProfileComplete);
                setId(_id);
                console.log("✅ Authenticated:", res.data);

                // const currentRoot = location.pathname.split("/")[1];
                // if (currentRoot !== role) {
                //     navigate(`/${role}`, { replace: true });
                // }

                if(role != "admin"){

                  const resNotif = await axiosInstance.get(
                      "/notification/notifications?page=1&limit=20"
                  );
                  setNotifications(resNotif.data.notifications);
                }

            } catch (err) {
              console.log(err)
                // console.warn("❌ Invalid token:", err.response?.data?.message || err.message);
                localStorage.removeItem("unicru-token");
            }
        };

        validateToken();
    }, []);

    return (
        <>
            <Toaster />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="/reverify" element={<ReverifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Admin Auth */}
                <Route path="/auth/admin/login" element={<AdminLogin />} />
                <Route path="/auth/admin/register" element={<AdminRegister />} />

                {/* User Auth */}
                <Route path="/auth/user/login" element={<UserLogin />} />
                <Route path="/auth/user/register" element={<UserRegister />} />

                {/* Company Auth */}
                <Route path="/auth/company/login" element={<CompanyLogin />} />
                <Route path="/auth/company/register" element={<CompanyRegister />} />

                {/* admin */}
                <Route path="/admin" element={<AdminHomePage />} />
                <Route path="/admin/entry" element={<AdminDataEntryPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/companies" element={<AdminCompaniesPage />} />
                <Route path="/admin/reviews" element={<AdminReviewsPage />} />

                {/* user */}
                <Route path="/user" element={<UserHomePage />} />
                <Route path="/user/profile" element={<UserProfilePage />} />

                {/* company */}
                <Route path="/company" element={<CompanyHomePage />} />
                <Route path="/company/profile" element={<CompanyProfilePage />} />
                <Route path="/company/job/:jobId" element={<CompanyJobDetailPage />} />
            </Routes>
        </>
    );
}

export default App;
