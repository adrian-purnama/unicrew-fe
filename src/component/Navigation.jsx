import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../utils/UserContext";
import { Bell, LogOut } from "lucide-react";
import { Popover } from "@headlessui/react";
import axiosInstance from "../../utils/ApiHelper";

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
    user: [
      { to: "/user", label: "Dashboard" },
      { to: "/user/profile", label: "Profile" },
    ],
    company: [
      { to: "/company", label: "Dashboard" },
      { to: "/company/profile", label: "Profile" },
    ],
    admin: [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/entry", label: "Data Entry" },
    ],
  };

  const links = roleLinks[role] || [];

  return (
    <nav className="nav-container flex items-center justify-between px-6 py-3 border-gray border-b-1 bg-color-1">
      <div className="flex items-center justify-between w-full">
        {/* Left */}
        <div className="flex items-center space-x-4">
          {/* <span className="text-xl font-semibold capitalize">Unicru</span> */}
          <img onClick={()=> navigate("/")} src="/unicru logo.png" alt="Unicru Logo" className="w-8 cursor-pointer"/>
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            {/* Notification */}
            <Popover className="relative">
              <Popover.Button className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Popover.Button>
              <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button
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

            <span className="text-sm">
              {username?.split(" ")[0] || "User"} / {role || "guest"}
            </span>
            <img
              src={
                profilePicture ||
                "https://cdn.vectorstock.com/i/500p/58/15/male-silhouette-profile-picture-vector-35845815.jpg"
              }
              alt="profile"
              className="avatar"
            />
            <button
              onClick={handleLogout}
              className="btn-logout flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/auth/company/login"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:border-gray-600 font-bold underline"
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
