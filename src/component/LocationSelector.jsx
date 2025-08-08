import { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../utils/ApiHelper";

const customStyles = {
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
};

export default function LocationSelector({ value = {}, onChange }) {
  const [options, setOptions] = useState({
    provinsi: [],
    kabupaten: [],
    kecamatan: [],
  });

  const selectedValues = {
    provinsi: options.provinsi.find((p) => p.value === value.provinsi) || null,
    kabupaten: options.kabupaten.find((k) => k.value === value.kabupaten) || null,
    kecamatan: options.kecamatan.find((k) => k.value === value.kecamatan) || null,
  };

  // Fetch Provinsi on mount
  useEffect(() => {
    axiosInstance.get("/admin/provinsi").then((res) => {
      const formatted = res.data.map((item) => ({
        label: item.name,
        value: item._id,
      }));
      setOptions((prev) => ({ ...prev, provinsi: formatted }));
    });
  }, []);

  // Fetch Kabupaten when provinsi changes
  useEffect(() => {
    if (!value.provinsi) return;
    axiosInstance.get(`/admin/kabupaten?provinsi=${value.provinsi}`).then((res) => {
      const formatted = res.data.map((item) => ({
        label: item.name,
        value: item._id,
      }));
      setOptions((prev) => ({ ...prev, kabupaten: formatted, kecamatan: [] }));
    });
  }, [value.provinsi]);

  // Fetch Kecamatan when kabupaten changes
  useEffect(() => {
    if (!value.kabupaten) return;
    axiosInstance.get(`/admin/kecamatan?kabupaten=${value.kabupaten}`).then((res) => {
      const formatted = res.data.map((item) => ({
        label: item.name,
        value: item._id,
      }));
      setOptions((prev) => ({ ...prev, kecamatan: formatted }));
    });
  }, [value.kabupaten]);

  const handleChange = (key, selected) => {
    const val = selected ? selected.value : "";
    const updated = {
      ...value,
      [key]: val,
      ...(key === "provinsi" ? { kabupaten: "", kecamatan: "" } : {}),
      ...(key === "kabupaten" ? { kecamatan: "" } : {}),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-semibold block mb-1">Provinsi</label>
        <Select
          options={options.provinsi}
          value={selectedValues.provinsi}
          onChange={(selected) => handleChange("provinsi", selected)}
          placeholder="Search provinsi..."
          isClearable
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <label className="font-semibold block mb-1">Kabupaten</label>
        <Select
          options={options.kabupaten}
          value={selectedValues.kabupaten}
          onChange={(selected) => handleChange("kabupaten", selected)}
          placeholder="Search kabupaten..."
          isClearable
          isDisabled={!value.provinsi}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div>
        <label className="font-semibold block mb-1">Kecamatan</label>
        <Select
          options={options.kecamatan}
          value={selectedValues.kecamatan}
          onChange={(selected) => handleChange("kecamatan", selected)}
          placeholder="Search kecamatan..."
          isClearable
          isDisabled={!value.kabupaten}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  );
}
