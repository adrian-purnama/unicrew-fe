// src/components/SkillSelector.jsx
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/ApiHelper";

// Reusable usage badge
const UsageBadge = ({ count }) => {
  if (!Number.isFinite(count)) return null;
  return (
    <span
      className="
        ml-1 inline-flex items-center
        text-[10px] leading-none font-medium
        px-1.5 py-[2px] rounded-full
        bg-primary-20 text-primary
        border border-primary/20
      "
      title={`${count.toLocaleString()} uses`}
    >
      {count}
    </span>
  );
};

// Chip label with usage count
const MultiValueLabel = (props) => {
  const count = props.data?.usageCount;
  return (
    <components.MultiValueLabel {...props}>
      <div className="flex items-center gap-1">
        <span>{props.data?.label}</span>
        <UsageBadge count={count} />
      </div>
    </components.MultiValueLabel>
  );
};

// Dropdown option with usage pill on the right
const Option = (props) => {
  const count = props.data?.usageCount;
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between">
        <span>{props.data?.label}</span>
        <UsageBadge count={count} />
      </div>
    </components.Option>
  );
};

export default function SkillSelector({ value = [], onChange }) {
  // Normalize selected values
  const selectedOptions = useMemo(() => {
    return value.map((item) => (typeof item === "string" ? { label: item, value: item } : item));
  }, [value]);

  // Fetch skills (includes usageCount)
  const fetchSkills = async (q) => {
    try {
      const res = await axiosInstance.get("/admin/skill/search", { params: { q } });
      return (res.data || []).map((s) => ({
        label: s.name,
        value: s._id,
        usageCount: s.usageCount,
      }));
    } catch {
      return [];
    }
  };

  // Debounced loader
  const debouncedFetch = useCallback(
    debounce((inputValue, cb) => {
      fetchSkills(inputValue).then(cb);
    }, 300),
    []
  );

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const loadOptions = (inputValue, callback) => {
    if (!inputValue) {
      fetchSkills("").then(callback);
    } else {
      debouncedFetch(inputValue, callback);
    }
  };

  return (
    <div className="text-color">
      <label className="font-semibold block mb-1">Skills</label>
      <AsyncSelect
        isMulti
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={selectedOptions}
        onChange={(opts) => onChange(opts || [])}
        placeholder="Search skills..."
        className="react-select-container"
        classNamePrefix="react-select"
        components={{ MultiValueLabel, Option }}
      />
    </div>
  );
}
