import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Sun, Moon } from "lucide-react";
import { Popover } from "@headlessui/react";
import axiosInstance from "../../utils/ApiHelper";
import { UserContext } from "../../utils/UserContext";

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
    notifications,
    setNotifications,
  } = useContext(UserContext);

  // theme: "light" | "dark" | "system"
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  const navigate = useNavigate();

  // Detect OS dark mode
  const mediaQuery = useMemo(
    () =>
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null,
    []
  );

  // Effective theme that actually applies to <html>
  const effectiveTheme = useMemo(() => {
    if (theme === "system") {
      return mediaQuery?.matches ? "dark" : "light";
    }
    return theme;
  }, [theme, mediaQuery?.matches]);

  // Apply/remove .dark on <html> and set color-scheme meta (optional)
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute("content", effectiveTheme === "dark" ? "dark light" : "light dark");
  }, [effectiveTheme]);

  // Persist choice
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // React to OS changes only if user chose "system"
  useEffect(() => {
    if (!mediaQuery) return;
    const handler = () => {
      if (theme === "system") {
        // Trigger recompute; no-op state setter keeps the same value but re-renders
        setTheme((t) => t);
      }
    };
    mediaQuery.addEventListener?.("change", handler);
    return () => mediaQuery.removeEventListener?.("change", handler);
  }, [theme, mediaQuery]);

  // Cycle Light → Dark → System → Light ...
  const cycleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
  };

  const handleLogout = () => {
    localStorage.removeItem("unicru-token");
    setUsername(null);
    setRole(null);
    setProfilePicture(null);
    setIsLoggedIn(false);
    setNotifications([]);
    navigate("/");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await axiosInstance.patch("/notification/notifications/mark-all-read");
      const refreshed = await axiosInstance.get("/notification/notifications?page=1&limit=20");
      setNotifications(refreshed.data.notifications);
    } catch (err) {
      console.error("❌ Failed to mark all as read:", err);
    }
  };

  const roleLinks = {
    user: [{ to: "/user", label: "Dashboard" }],
    company: [{ to: "/company", label: "Dashboard" }],
    admin: [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/entry", label: "Data Entry" },
    ],
  };

  const IconToggle = effectiveTheme === "light" ? Moon : Sun;

  return (
    <nav className="nav-container flex items-center justify-between px-6 py-3 border-gray border-b-1 bg-color-1">
      <div className="flex items-center justify-between w-full">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <img
            onClick={() => navigate("/")}
            src="/unicru logo.png"
            alt="Unicru Logo"
            className="w-8 cursor-pointer"
          />
        </div>

        {/* Right */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle (square, centered) */}
            <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${theme === "system" ? `System (${effectiveTheme})` : `${theme} (override)`}`}
              className="relative flex items-center justify-center w-9 h-9 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <IconToggle className="w-5 h-5" />
              {theme === "system" && (
                <span className="absolute -bottom-1 -right-1 text-[10px] leading-none px-1 rounded bg-gray-300 dark:bg-gray-600">
                  System
                </span>
              )}
            </button>

            {/* Notifications (square, centered) */}
            <Popover className="relative">
              <Popover.Button
                type="button"
                className="relative flex items-center justify-center w-9 h-9 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
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

            <Link to={`/${role}/profile`} className="flex items-center gap-2">
              <span className="text-sm">
                {username?.split(" ")[0] || "User"} / {role || "guest"}
              </span>
              <img
                src={
                  profilePicture ||
                  "https://cdn.vectorstock.com/i/500p/58/15/male-silhouette-profile-picture-vector-35845815.jpg"
                }
                alt="profile"
                className="avatar size-6"
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
            {/* Theme Toggle (square, centered) */}
            <button
              type="button"
              onClick={cycleTheme}
              title={`Theme: ${theme === "system" ? `System (${effectiveTheme})` : `${theme} (override)`}`}
              className="relative flex items-center justify-center w-9 h-9 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <IconToggle className="w-5 h-5" />
              {theme === "system" && (
                <span className="absolute -bottom-1 -right-1 text-[10px] leading-none px-1 rounded bg-gray-300 dark:bg-gray-600">
                  S
                </span>
              )}
            </button>

            <Link
              to="/auth/company/login"
              className="px-4 py-2 text-color hover:border-gray-600 font-bold underline text-color"
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
