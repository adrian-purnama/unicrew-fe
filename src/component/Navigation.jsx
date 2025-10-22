// src/components/nav/Navigation.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Sun, Moon, Monitor, MoreHorizontal, FileText } from "lucide-react";
import { Popover } from "@headlessui/react";
import axiosInstance from "../../utils/ApiHelper";
import { UserContext } from "../../utils/UserContext";
import ProtectedImage from "./ProtectedImage";

export default function Navigation() {
  const {
    username,
    role,
    profilePicture,
    setUsername,
    setRole,
    setProfilePicture,
    isLoggedIn,
    setIsLoggedIn,
    notifications = [],
    setNotifications,
  } = useContext(UserContext);

  // ---------------- THEME ----------------
  // "system" | "light" | "dark"
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  // Apply .dark on <html> based on user choice & OS preference
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;

    const apply = () => {
      const choice = localStorage.getItem("theme") || "system";
      const isDark = choice === "dark" || (choice === "system" && mq.matches);

      const root = document.documentElement;
      root.classList.toggle("dark", isDark);

      // Optional: hint native controls (form fields) about color scheme
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.setAttribute("content", isDark ? "dark light" : "light dark");
    };

    // Initial apply
    apply();

    // React to OS theme flips when in "system"
    const onChange = () => {
      if ((localStorage.getItem("theme") || "system") === "system") apply();
    };

    mq.addEventListener?.("change", onChange);
    mq.addListener?.(onChange); // Safari fallback

    // React to changes from other tabs/windows/components
    const onStorage = (e) => {
      if (e.key === "theme") apply();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      mq.removeEventListener?.("change", onChange);
      mq.removeListener?.(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Persist & broadcast when user picks a theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
    // Broadcast so the apply() above re-runs immediately
    window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: theme }));
  }, [theme]);

  // Cycle Light → Dark → System
  const cycleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));

  // For the icon, show monitor when 'system'; otherwise show the opposite to hint the next state toggle
  const effectiveTheme = useMemo(() => {
    if (theme !== "system") return theme;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [theme]);

  const IconToggle = theme === "system" ? Monitor : effectiveTheme === "light" ? Moon : Sun;

  // ---------------- NAV LOGIC ----------------
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("unicru-token");
    setUsername(null);
    setRole(null);
    setProfilePicture(null);
    setIsLoggedIn(false);
    setNotifications([]);
    navigate("/");
  };

  const unreadCount = notifications.filter?.((n) => !n.isRead).length || 0;

  const markAllRead = async () => {
    try {
      await axiosInstance.patch("/notification/notifications/mark-all-read");
      const refreshed = await axiosInstance.get("/notification/notifications?page=1&limit=20");
      setNotifications(refreshed.data.notifications || []);
    } catch (err) {
      console.error("❌ Failed to mark all as read:", err);
    }
  };

  const handleLogoClick = () => {
    if (isLoggedIn) {
      if (role) navigate(`/${role}`);
      else navigate("/");
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="nav-container flex items-center justify-between px-6 py-3 border-b bg-color-1 border-gray">
      <div className="flex items-center justify-between w-full">
        {/* Left: Logo */}
        <div className="flex items-center space-x-4">
          <img
            onClick={handleLogoClick}
            src="/unicru logo.png"
            alt="Unicru Logo"
            className="w-8 cursor-pointer"
          />
        </div>

        {/* Right side */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Theme Toggle */}
            {/* <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${
                theme === "system" ? `System (${effectiveTheme})` : `${theme} (override)`
              }`}
              className="relative flex items-center justify-center w-9 h-9 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <IconToggle className="w-5 h-5" />
              {theme === "system" && (
                <span className="absolute -bottom-1 -right-1 text-[10px] leading-none px-1 rounded bg-gray-300 dark:bg-gray-600">
                  Sys
                </span>
              )}
            </button> */}

            {/* Notifications */}
            <Popover className="relative">
              <Popover.Button
                type="button"
                className="relative flex items-center justify-center w-9 h-9 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Popover.Button>
              <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`py-2 text-sm ${
                          notif.isRead
                            ? "text-gray-600"
                            : "font-medium text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {notif.message}
                        <div className="text-xs text-gray-400">
                          {new Date(notif.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Popover.Panel>
            </Popover>

            {/* Profile & Logout */}
            <Link to={`/${role}/profile`} className="flex items-center gap-2">
              <span className="text-sm notranslate">
                {username?.split(" ")[0] || "User"} / {role || "guest"}
              </span>
              <ProtectedImage
                src={profilePicture}
                alt="profile"
                className="avatar size-6"
                fallback="https://cdn.vectorstock.com/i/500p/58/15/male-silhouette-profile-picture-vector-35845815.jpg"
              />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-logout flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 text-sm">

            {/* Theme Toggle (guest) */}
            {/* <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${
                theme === "system" ? `System (${effectiveTheme})` : `${theme} (override)`
              }`}
              className="relative flex items-center justify-center w-9 h-9 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <IconToggle className="w-5 h-5" />
              {theme === "system" && (
                <span className="absolute -bottom-1 -right-1 text-[10px] leading-none px-1 rounded bg-gray-300 dark:bg-gray-600">
                  Sys
                </span>
              )}
            </button> */}

            <Link
              to="/auth/company/login"
              className="px-4 py-2 font-bold underline text-color hover:border-gray-600"
            >
              For Employers
            </Link>
            <Link
              to="/auth/user/login"
              className="px-4 py-2 btn-primary transition font-bold text-color-white"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
