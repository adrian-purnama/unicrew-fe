// src/components/SkillComposer.jsx
import AsyncCreatableSelect from "react-select/async-creatable";
import { components } from "react-select";
import debounce from "lodash.debounce";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
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

export default function SkillComposer({ value = [], onChange }) {
  const [creating, setCreating] = useState(false);

  // Normalize incoming value: [{label, value, usageCount?}] or strings
  const selected = Array.isArray(value)
    ? value.map((v) => (typeof v === "string" ? { label: v, value: v } : v))
    : [];

  // Fetch skills (your endpoint already returns usageCount)
  const fetchSkills = async (q) => {
    try {
      const res = await axiosInstance.get("/admin/skill/search", { params: { q, limit: 10 } });
      return (res.data || []).map((s) => ({
        label: s.name,
        value: s._id,
        usageCount: s.usageCount,
      }));
    } catch {
      return [];
    }
  };

  // Debounced async loader
  const debouncedFetch = useCallback(
    debounce((input, cb) => {
      fetchSkills(input).then(cb);
    }, 300),
    []
  );

  const loadOptions = (input, cb) => {
    if (!input) fetchSkills("").then(cb);
    else debouncedFetch(input, cb);
  };

  // Create + attach new skill, then add to selection with an initial count
  const onCreateOption = async (input) => {
    const cleaned = input.trim().replace(/\s+/g, " ");
    if (!cleaned) return;

    setCreating(true);
    const t = toast.loading(`Adding “${cleaned}”...`);
    try {
      const { data } = await axiosInstance.post("/user/skill/add", { name: cleaned });
      const created = data?.results?.[0]?.skill;
      if (!created?._id) throw new Error("Skill create failed");

      onChange([
        ...(selected || []),
        {
          label: created.name || cleaned,
          value: created._id,
          usageCount: Number.isFinite(created.usageCount) ? created.usageCount : 1,
        },
      ]);
      toast.success(`Added “${created.name || cleaned}”`, { id: t });
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to add “${cleaned}”`, { id: t });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="text-color">
      <label className="font-semibold block mb-1">Skills</label>
      <p className="text-xs text-gray mb-2">
        Type to search or press <strong>Enter</strong> to create a new skill.
      </p>

      <AsyncCreatableSelect
        isMulti
        isDisabled={creating}
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={selected}
        onChange={(opts) => onChange(opts || [])}
        onCreateOption={onCreateOption}
        placeholder="Search or create a skill…"
        className="react-select-container"
        classNamePrefix="react-select"
        components={{ MultiValueLabel, Option }}
        formatCreateLabel={(input) => `Create “${input}”`}
      />
    </div>
  );
}
