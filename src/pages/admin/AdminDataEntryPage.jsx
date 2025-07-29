import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";

export default function AdminDataEntryPage() {
  const [provinsiList, setProvinsiList] = useState([]);
  const [kabupatenList, setKabupatenList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);

  const [industryList, setIndustryList] = useState([]);
  const [skillList, setSkillList] = useState([]);
  const [universityList, setUniversityList] = useState([]);
  const [studyProgramList, setStudyProgramList] = useState([]);

  const [industryName, setIndustryName] = useState("");
  const [skillName, setSkillName] = useState("");
  const [studyProgramName, setStudyProgramName] = useState("");

  const [universityName, setUniversityName] = useState("");
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);

  const [locationLevel, setLocationLevel] = useState("provinsi");
  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKabupaten, setSelectedKabupaten] = useState("");
  const [locationName, setLocationName] = useState("");

  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (selectedProvinsi) fetchKabupaten(selectedProvinsi);
  }, [selectedProvinsi]);

  useEffect(() => {
    if (selectedKabupaten) fetchKecamatan(selectedKabupaten);
  }, [selectedKabupaten]);

  const fetchAll = async () => {
    await Promise.all([
      fetchProvinsi(),
      fetchIndustries(),
      fetchSkills(),
      fetchUniversities(),
      fetchStudyPrograms(),
    ]);
  };

  const fetchProvinsi = async () => {
    const res = await axiosInstance.get("/admin/provinsi");
    setProvinsiList(res.data);
  };

  const fetchKabupaten = async (provinsiId) => {
    const res = await axiosInstance.get(`/admin/kabupaten?provinsi=${provinsiId}`);
    setKabupatenList(res.data);
  };

  const fetchKecamatan = async (kabupatenId) => {
    const res = await axiosInstance.get(`/admin/kecamatan?kabupaten=${kabupatenId}`);
    setKecamatanList(res.data);
  };

  const fetchIndustries = async () => {
    const res = await axiosInstance.get("/admin/industry");
    setIndustryList(res.data);
  };

  const fetchSkills = async () => {
    const res = await axiosInstance.get("/admin/skill");
    setSkillList(res.data);
  };

  const fetchUniversities = async () => {
    const res = await axiosInstance.get("/admin/university");
    setUniversityList(res.data);
  };

  const fetchStudyPrograms = async () => {
    const res = await axiosInstance.get("/admin/study-program");
    setStudyProgramList(res.data);
  };

  const handleAdd = async (type, value, endpoint) => {
    if (!value) return toast.error(`${type} cannot be empty`);
    try {
      await axiosInstance.post(endpoint, { name: value });
      toast.success(`${type} added`);
      if (type === "Industry") {
        setIndustryName("");
        fetchIndustries();
      } else if (type === "Skill") {
        setSkillName("");
        fetchSkills();
      } else if (type === "Study Program") {
        setStudyProgramName("");
        fetchStudyPrograms();
      }
    } catch {
      toast.error(`Failed to add ${type}`);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      await axiosInstance.delete(`/admin/${type}/${id}`);
      toast.success(`${type} deleted`);
      fetchAll();
    } catch {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleUniversitySubmit = async () => {
    try {
      await axiosInstance.post("/admin/university", {
        name: universityName,
        speciality: selectedSpecialities,
      });
      toast.success("University added");
      setUniversityName("");
      setSelectedSpecialities([]);
      fetchUniversities();
    } catch {
      toast.error("Failed to add university");
    }
  };

  const handleLocationSubmit = async () => {
    try {
      let endpoint = "";
      let payload = { name: locationName };

      if (locationLevel === "provinsi") endpoint = "/admin/provinsi";
      if (locationLevel === "kabupaten") {
        endpoint = "/admin/kabupaten";
        payload.provinsi = selectedProvinsi;
      }
      if (locationLevel === "kecamatan") {
        endpoint = "/admin/kecamatan";
        payload.kabupaten = selectedKabupaten;
      }

      await axiosInstance.post(endpoint, payload);
      toast.success("Location added!");
      setLocationName("");

      if (locationLevel === "provinsi") fetchProvinsi();
      if (locationLevel === "kabupaten") fetchKabupaten(selectedProvinsi);
      if (locationLevel === "kecamatan") fetchKecamatan(selectedKabupaten);
    } catch {
      toast.error("Failed to add location");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axiosInstance.get("/admin/sync-location");
      toast.success("Location sync completed");
      fetchProvinsi();
    } catch {
      toast.error("Location sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold text-center">Admin Data Entry</h1>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        {syncing ? "Syncing..." : "🔄 Sync Location Data"}
      </button>

      {/* Location */}
      <section>
        <h2 className="text-xl font-semibold">Location</h2>
        <select value={locationLevel} onChange={(e) => setLocationLevel(e.target.value)} className="border p-2 rounded w-full mb-2">
          <option value="provinsi">Provinsi</option>
          <option value="kabupaten">Kabupaten</option>
          <option value="kecamatan">Kecamatan</option>
        </select>
        {["kabupaten", "kecamatan"].includes(locationLevel) && (
          <select value={selectedProvinsi} onChange={(e) => setSelectedProvinsi(e.target.value)} className="border p-2 rounded w-full mb-2">
            <option value="">Select Provinsi</option>
            {provinsiList.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        )}
        {["kecamatan"].includes(locationLevel) && (
          <select value={selectedKabupaten} onChange={(e) => setSelectedKabupaten(e.target.value)} className="border p-2 rounded w-full mb-2">
            <option value="">Select Kabupaten</option>
            {kabupatenList.map((k) => (
              <option key={k._id} value={k._id}>{k.name}</option>
            ))}
          </select>
        )}
        <input value={locationName} onChange={(e) => setLocationName(e.target.value)} className="border p-2 rounded w-full mb-2" placeholder="Location name" />
        <button onClick={handleLocationSubmit} className="bg-purple-600 text-white px-4 py-2 rounded">Submit Location</button>
      </section>

      {/* Industry */}
      <section>
        <h2 className="text-xl font-semibold">Industry</h2>
        <input value={industryName} onChange={(e) => setIndustryName(e.target.value)} className="border p-2 rounded w-full mb-2" placeholder="Industry name" />
        <button onClick={() => handleAdd("Industry", industryName, "/admin/industry")} className="bg-blue-600 text-white px-4 py-2 rounded">Add Industry</button>
        <ul className="mt-2">
          {industryList.map((item) => (
            <li key={item._id} className="flex justify-between">
              <span>{item.name}</span>
              <button onClick={() => handleDelete("industry", item._id)} className="text-red-500">Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Skill */}
      <section>
        <h2 className="text-xl font-semibold">Skill</h2>
        <input value={skillName} onChange={(e) => setSkillName(e.target.value)} className="border p-2 rounded w-full mb-2" placeholder="Skill name" />
        <button onClick={() => handleAdd("Skill", skillName, "/admin/skill")} className="bg-green-600 text-white px-4 py-2 rounded">Add Skill</button>
        <ul className="mt-2">
          {skillList.map((item) => (
            <li key={item._id} className="flex justify-between">
              <span>{item.name}</span>
              <button onClick={() => handleDelete("skill", item._id)} className="text-red-500">Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Study Program */}
      <section>
        <h2 className="text-xl font-semibold">Study Program</h2>
        <input value={studyProgramName} onChange={(e) => setStudyProgramName(e.target.value)} className="border p-2 rounded w-full mb-2" placeholder="Study Program name" />
        <button onClick={() => handleAdd("Study Program", studyProgramName, "/admin/study-program")} className="bg-orange-600 text-white px-4 py-2 rounded">Add Study Program</button>
        <ul className="mt-2">
          {studyProgramList.map((item) => (
            <li key={item._id} className="flex justify-between">
              <span>{item.name}</span>
              <button onClick={() => handleDelete("study-program", item._id)} className="text-red-500">Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {/* University */}
      <section>
        <h2 className="text-xl font-semibold">University</h2>
        <input value={universityName} onChange={(e) => setUniversityName(e.target.value)} className="border p-2 rounded w-full mb-2" placeholder="University name" />
        <select multiple value={selectedSpecialities} onChange={(e) => setSelectedSpecialities([...e.target.selectedOptions].map(o => o.value))} className="border p-2 rounded w-full mb-2">
          {studyProgramList.map((sp) => (
            <option key={sp._id} value={sp._id}>{sp.name}</option>
          ))}
        </select>
        <button onClick={handleUniversitySubmit} className="bg-indigo-600 text-white px-4 py-2 rounded">Add University</button>
        <ul className="mt-4 space-y-2">
          {universityList.map((uni) => (
            <li key={uni._id}>
              <strong>{uni.name}</strong>
              {uni.speciality?.length > 0 && (
                <ul className="ml-4 list-disc text-sm">
                  {uni.speciality.map(sp => <li key={typeof sp === "string" ? sp : sp._id}>{typeof sp === "string" ? sp : sp.name}</li>)}
                </ul>
              )}
              <button onClick={() => handleDelete("university", uni._id)} className="text-red-500 text-sm">Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
