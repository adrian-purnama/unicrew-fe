import AsyncSelect from "react-select/async";
import { useCallback, useEffect, useMemo } from "react";
import debounce from "lodash.debounce";
import axiosInstance from "../../utils/ApiHelper";

const IndustrySelector = ({ value = [], onChange }) => {
  const selectedOptions = useMemo(() => {
    return value.map((item) =>
      typeof item === "string"
        ? { label: item, value: item } // fallback if not hydrated
        : item
    );
  }, [value]);

  const fetchIndustries = async (inputValue) => {
    try {
      const res = await axiosInstance.get(`/admin/industry/search?q=${inputValue}`);
      return res.data.map((industry) => ({
        label: industry.name,
        value: industry._id,
      }));
    } catch {
      return [];
    }
  };

  const debouncedFetch = useCallback(
    debounce((inputValue, cb) => {
      fetchIndustries(inputValue).then(cb);
    }, 300),
    []
  );

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch]);

  const loadOptions = (inputValue, callback) => {
    if (!inputValue) {
      fetchIndustries("").then(callback);
    } else {
      debouncedFetch(inputValue, callback);
    }
  };

  const handleChange = (selected) => {
    onChange(selected || []);
  };

  return (
    <div>
      <label className="font-semibold block mb-1">Industries</label>
      <AsyncSelect
        isMulti
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="Search industries..."
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default IndustrySelector;
