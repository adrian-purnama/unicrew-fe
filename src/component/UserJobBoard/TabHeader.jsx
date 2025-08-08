import { Bookmark } from "lucide-react";

export default function TabHeader({ activeTab, onChange }) {
  const tabs = [
    { key: "find", label: "Find Jobs" },
    { key: "saved", label: "Saved", icon: Bookmark },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "review", label: "Review" },

  ];

  return (
    <div className="flex gap-6 border-b border-gray-300 pb-2">
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
  );
}