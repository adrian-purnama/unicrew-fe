import { Search } from "lucide-react";

export default function SearchBar({ value, onChange }) {
    return (
        <div className="relative w-full flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search Your Dream Job"
                className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 bg-white text-sm text-gray-800
                    focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 transition"
            />
        </div>
    );
}
