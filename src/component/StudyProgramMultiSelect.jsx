import { useEffect, useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import axiosInstance from "../../utils/ApiHelper";

export default function StudyProgramMultiSelect({
  value = [],
  onChange,
  initialOptions = [],
  placeholder = "Search study programs…",
}) {
  // Track dark mode by watching <html class="dark">
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Palette (tuned for contrast on both themes)
  const palette = useMemo(() => {
    return isDark
      ? {
          surface: "rgba(255,255,255,0.04)",
          surfaceStrong: "rgba(255,255,255,0.08)",
          border: "rgba(255,255,255,0.18)",
          text: "#E5E7EB",         // slate-200
          textSubtle: "#9CA3AF",   // slate-400
          chipBg: "rgba(255,255,255,0.10)",
          chipBorder: "rgba(255,255,255,0.22)",
          optionHover: "rgba(255,255,255,0.08)",
          optionSelected: "rgba(99,102,241,0.25)", // primary-ish
          focus: "#60A5FA",        // sky-400
        }
      : {
          surface: "#FFFFFF",
          surfaceStrong: "#FFFFFF",
          border: "rgba(55,65,81,0.20)", // slate-700 @ 20%
          text: "#111827",               // gray-900
          textSubtle: "#6B7280",         // gray-500
          chipBg: "rgba(99,102,241,0.10)",
          chipBorder: "rgba(55,65,81,0.25)",
          optionHover: "rgba(0,0,0,0.04)",
          optionSelected: "rgba(99,102,241,0.15)",
          focus: "#2563EB",              // blue-600
        };
  }, [isDark]);

  // Map initial list for labels
  const initialMap = useMemo(() => {
    const m = new Map();
    (initialOptions || []).forEach((sp) => m.set(String(sp._id), sp.name));
    return m;
  }, [initialOptions]);

  const selectedOptions = useMemo(
    () => (value || []).map((id) => ({ value: id, label: initialMap.get(String(id)) || id })),
    [value, initialMap]
  );

  // Load from server
  const fetchOptions = async (inputValue) => {
    try {
      const { data } = await axiosInstance.get("/admin/study-program/search", {
        params: { q: inputValue || "" },
      });
      return (data || [])
        .map((sp) => ({ value: String(sp._id), label: sp.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch {
      return [];
    }
  };

  // Default list when no search term
  const defaultOptions = useMemo(() => {
    return (initialOptions || [])
      .map((sp) => ({ value: String(sp._id), label: sp.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [initialOptions]);

  const handleChange = (opts) => onChange((opts || []).map((o) => o.value));

  return (
    <AsyncSelect
      isMulti
      cacheOptions
      defaultOptions={defaultOptions}
      loadOptions={fetchOptions}
      value={selectedOptions}
      onChange={handleChange}
      placeholder={placeholder}
      className="react-select-container w-full"
      classNamePrefix="react-select"
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: 38,
          backgroundColor: palette.surface,
          borderColor: state.isFocused ? palette.focus : palette.border,
          boxShadow: "none",
          ":hover": { borderColor: state.isFocused ? palette.focus : palette.border },
        }),
        valueContainer: (base) => ({
          ...base,
          color: palette.text,
        }),
        input: (base) => ({
          ...base,
          color: palette.text,
        }),
        placeholder: (base) => ({
          ...base,
          color: palette.textSubtle,
        }),
        singleValue: (base) => ({
          ...base,
          color: palette.text,
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: palette.chipBg,
          border: `1px solid ${palette.chipBorder}`,
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: palette.text,
          fontSize: 12,
          paddingRight: 4,
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: palette.textSubtle,
          ":hover": {
            backgroundColor: "transparent",
            color: palette.text,
          },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: palette.surfaceStrong,
          border: `1px solid ${palette.border}`,
          zIndex: 40,
          overflow: "hidden",
        }),
        menuList: (base) => ({
          ...base,
          paddingTop: 4,
          paddingBottom: 4,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? palette.optionSelected
            : state.isFocused
            ? palette.optionHover
            : "transparent",
          color: palette.text,
          ":active": {
            backgroundColor: palette.optionSelected,
          },
        }),
        indicatorsContainer: (base) => ({
          ...base,
          color: palette.textSubtle,
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          color: state.isFocused ? palette.text : palette.textSubtle,
          ":hover": { color: palette.text },
        }),
        clearIndicator: (base) => ({
          ...base,
          color: palette.textSubtle,
          ":hover": { color: palette.text },
        }),
      }}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          neutral0: palette.surface, // control bg
          primary: palette.focus,
          primary25: palette.optionHover,
        },
      })}
    />
  );
}
