// components/form/CustomSelect.jsx
import Select from "react-select";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/ApiHelper";

export default function CustomSelect({
  label,
  endpoint,           // e.g., "/admin/university"
  placeholder = "Search...",
  value,
  onChange,
}) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    axiosInstance
      .get(endpoint)
      .then((res) => {
        const mapped = res.data.map((item) => ({
          label: item.name,
          value: item._id,
        }));
        setOptions(mapped);
      })
      .catch(() => setOptions([]));
  }, [endpoint]);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return typeof value === "object"
      ? value
      : options.find((opt) => opt.value === value) || null;
  }, [value, options]);

  const handleChange = (selected) => {
    onChange(selected);
  };

  return (
    <div>
      {label && <label className="font-semibold block mb-1">{label}</label>}
      <Select
        isClearable
        isSearchable
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "var(--tw-bg-color, white)",
            borderColor: "#d1d5db",
            borderRadius: "0.375rem",
            padding: "0.125rem 0.25rem",
            minHeight: "40px",
            boxShadow: "none",
            "&:hover": {
              borderColor: "#4f46e5",
            },
          }),
          menu: (base) => ({
            ...base,
            zIndex: 999,
          }),
        }}
      />
    </div>
  );
}
