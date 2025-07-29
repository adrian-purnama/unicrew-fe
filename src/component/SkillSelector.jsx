import AsyncSelect from "react-select/async";
import { useCallback, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import axiosInstance from "../../utils/ApiHelper";

const SkillSelector = ({ value = [], onChange }) => {
  // Ensure correct shape for selected values
  const selectedOptions = useMemo(() => {
    return value.map((item) =>
      typeof item === "string"
        ? { label: item, value: item } // fallback label if not hydrated
        : item
    );
  }, [value]);

  const fetchSkills = async (inputValue) => {
    try {
      const res = await axiosInstance.get(`/admin/skill/search?q=${inputValue}`);
      return res.data.map((skill) => ({
        label: skill.name,
        value: skill._id,
      }));
    } catch {
      return [];
    }
  };

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

  const handleChange = (selected) => {
    onChange(selected || []);
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
        onChange={handleChange}
        placeholder="Search skills..."
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default SkillSelector;
