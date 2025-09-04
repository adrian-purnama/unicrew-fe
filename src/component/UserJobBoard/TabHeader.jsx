// TabHeader.jsx — ultra-subtle Pending breakdown (hover/tap to reveal)
import { Bookmark, Menu, Info } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import { APP_EVENTS } from "../../../utils/appEvent";

export default function TabHeader({ activeTab, onChange, autoRefresh = true }) {
  const tabs = [
    { key: "find", label: "Find Jobs" },
    { key: "saved", label: "Saved", icon: Bookmark }, // no badge
    { key: "pending", label: "Pending" },             // badge + tiny info dot
    { key: "accepted", label: "Accepted" },
    { key: "review", label: "Review" },
  ];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [counts, setCounts] = useState({
    applied: 0,
    shortListed: 0,
    pending: 0,
    accepted: 0,
    review: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(false);

  async function fetchCounts() {
    try {
      setLoadingCounts(true);
      const { data } = await axiosInstance.get("/user/my-counts");
      setCounts({
        applied: Number(data?.applied || 0),
        shortListed: Number(data?.shortListed || 0),
        pending: Number(data?.pending || 0),
        accepted: Number(data?.accepted || 0),
        review: Number(data?.review || 0),
      });
    } catch (e) {
      console.warn("Failed to load counts:", e);
    } finally {
      setLoadingCounts(false);
    }
  }

  useEffect(() => {
    fetchCounts();
  }, []);

useEffect(() => {
  const handler = () => fetchCounts();
  window.addEventListener(APP_EVENTS.APPLICATIONS_UPDATED, handler);
  return () => window.removeEventListener(APP_EVENTS.APPLICATIONS_UPDATED, handler);
}, []);



  function selectTab(key) {
    onChange(key);
    setDrawerOpen(false);
  }

  const mainBadge = (key) => {
    const val =
      key === "pending" ? counts.pending :
        key === "accepted" ? counts.accepted :
          key === "review" ? counts.review : 0;
    return val > 0 ? (
      <span className="ml-2 text-[10px] leading-4 px-1.5 py-0.5 rounded-full bg-primary text-white">
        {val}
      </span>
    ) : null;
  };

  // ---------- Tiny info popover for Pending ----------
  function PendingInfo({ className = "" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click (mobile tap)
    useEffect(() => {
      function onDocClick(e) {
        if (!ref.current) return;
        if (!ref.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener("click", onDocClick);
      return () => document.removeEventListener("click", onDocClick);
    }, []);

    if (counts.pending === 0) return null;

    return (
      <span
        ref={ref}
        className={`relative inline-flex items-center ${className}`}
        // Desktop: show on hover/focus
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* 6px info dot; click on mobile to toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          aria-label={`Pending breakdown: Applied ${counts.applied}, Shortlisted ${counts.shortListed}`}
          className="w-1.5 h-1.5 rounded-full bg-gray-400/70 hover:bg-gray-500 focus:outline-none ml-1"
        />
        {/* Popover */}
        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 top-5 z-50 rounded-md border border-gray-200 bg-white shadow-lg px-2 py-1 text-[11px] text-gray-700 whitespace-nowrap">
            Applied (Waiting): {counts.applied} • Shortlisted: {counts.shortListed}
          </div>
        )}
      </span>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile trigger */}
      <div className="sm:hidden flex items-center justify-end p-2 border-b border-gray-300">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-primary font-semibold"
          aria-label="Open tabs menu"
        >
          <Menu className="w-5 h-5" />
          {tabs.find((tab) => tab.key === activeTab)?.label}
          {mainBadge(activeTab)}
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black z-40 opacity-50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-color-1 z-50 shadow-lg p-4 flex flex-col pt-10">
            <nav className="flex flex-col gap-3">
              {tabs.map((tab) => (
                <div key={tab.key} className="relative">
                  <button
                    onClick={() => selectTab(tab.key)}
                    className={`flex w-full items-center gap-2 p-2 rounded font-medium text-left transition-colors duration-200 ${activeTab === tab.key
                        ? "bg-primary text-white"
                        : "text-gray-500 hover:bg-gray-100"
                      }`}
                  >
                    {tab.icon && <tab.icon className="w-5 h-5" />}
                    <span className="flex-1">{tab.label}</span>
                    {mainBadge(tab.key)}
                    {tab.key === "pending" && <PendingInfo className="ml-1" />}
                  </button>
                </div>
              ))}
              {loadingCounts && (
                <span className="text-xs text-gray-500 mt-2">Refreshing…</span>
              )}
            </nav>
          </div>
        </>
      )}

      {/* Desktop tabs */}
      <div className="hidden sm:flex gap-6 border-b border-gray-300 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`pb-2 relative font-medium transition-colors duration-200 flex items-center gap-2 ${activeTab === tab.key
                ? "text-primary after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                : "text-gray-500 hover:text-gray-700"
              }`}
            // native title for the smallest footprint possible
            title={
              tab.key === "pending" && counts.pending > 0
                ? `Applied: ${counts.applied} • Shortlisted: ${counts.shortListed}`
                : undefined
            }
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {mainBadge(tab.key)}
            {tab.key === "pending" && <PendingInfo />}
          </button>
        ))}
      </div>
    </div>
  );
}
