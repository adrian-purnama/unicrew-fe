import React from "react";

export default function StatCard({ icon, title, value, subtitle, color = "primary" }) {
  const colorClasses = {
    primary: "bg-primary-20 border-primary text-primary",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
    orange: "bg-orange-50 border-orange-200 text-orange-600",
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg hover:scale-105 duration-300 cursor-pointer group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1 group-hover:scale-110 transition-transform duration-300">{value}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl opacity-60 group-hover:rotate-12 transition-transform duration-300">{icon}</div>
      </div>
    </div>
  );
}