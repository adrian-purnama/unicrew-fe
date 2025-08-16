import React from "react";

export default function TabsBar({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="bg-color-2 rounded-xl mb-6 shadow-sm border border-gray overflow-hidden">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap group ${activeTab === tab.key ? "text-primary bg-primary-20" : "text-gray hover:text-primary hover:bg-color-1"}`}
          >
            <span className="text-xl group-hover:scale-125 transition-transform duration-200">{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.key ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}>{tab.count}</span>
            )}
            {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-highlight"></div>}
          </button>
        ))}
      </div>
    </div>
  );
}