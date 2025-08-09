import { Bookmark, Menu } from "lucide-react";
import { useState } from "react";

export default function TabHeader({ activeTab, onChange }) {
  const tabs = [
    { key: "find", label: "Find Jobs" },
    { key: "saved", label: "Saved", icon: Bookmark },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "review", label: "Review" },
  ];

  const [drawerOpen, setDrawerOpen] = useState(false);

  function selectTab(key) {
    onChange(key);
    setDrawerOpen(false);
  }

  return (
    <div className="w-full">
      {/* Mobile: Button to open drawer */}
      <div className="sm:hidden flex items-center justify-end p-2 border-b border-gray-300">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-primary font-semibold"
          aria-label="Open tabs menu"
        >
          <Menu className="w-5 h-5" />
          {tabs.find((tab) => tab.key === activeTab)?.label}
        </button>
      </div>

      {/* Mobile: Drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black z-40"
            style={{ opacity: 0.5 }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel (from right) */}
          <div className="fixed top-0 right-0 h-full w-64 bg-color-1 z-50 shadow-lg p-4 flex flex-col pt-10">
            <nav className="flex flex-col gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => selectTab(tab.key)}
                  className={`flex items-center gap-2 p-2 rounded font-medium text-left transition-colors duration-200 ${
                    activeTab === tab.key
                      ? "bg-primary text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tab.icon && <tab.icon className="w-5 h-5" />}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Desktop: Tabs */}
      <div className="hidden sm:flex gap-6 border-b border-gray-300 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`pb-2 relative font-medium transition-colors duration-200 flex items-center gap-2 ${
              activeTab === tab.key
                ? "text-primary after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {/* <div className="mt-4 p-4 border rounded bg-white">
        {activeTab === "find" && <div>Find Jobs Content</div>}
        {activeTab === "saved" && <div>Saved Jobs Content</div>}
        {activeTab === "pending" && <div>Pending Jobs Content</div>}
        {activeTab === "accepted" && <div>Accepted Jobs Content</div>}
        {activeTab === "review" && <div>Review Content</div>}
      </div> */}
    </div>
  );
}
