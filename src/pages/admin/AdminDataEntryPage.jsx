import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import Footer from "../../component/Footer";
import Navigation from "../../component/Navigation";
import StudyProgramMultiSelect from "../../component/StudyProgramMultiSelect";

/** Mini helpers */
const Confirm = (msg) => window.confirm(msg);
const cls = (...a) => a.filter(Boolean).join(" ");
const Pill = ({ children, className }) => (
  <span
    className={cls(
      "inline-flex items-center rounded-full px-2 py-[2px] text-xs border",
      "bg-color-1 text-color border-gray",
      className
    )}
  >
    {children}
  </span>
);

/** -------- Hoisted: Reusable inline editable row (now top-level) -------- */
function EditableRow({ item, onSave, onDelete, rightNode, placeholder = "Name" }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.name || "");
  return (
    <li className="flex items-center justify-between gap-3 border-b border-gray py-2">
      <div className="flex items-center gap-3 min-w-0">
        {editing ? (
          <input
            className="w-full max-w-xs rounded border border-gray bg-color-1 text-color px-2 py-1"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <span className="truncate">{item.name}</span>
        )}
        {rightNode}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {editing ? (
          <>
            <button
              className="px-2 py-1 rounded border border-gray bg-color-2"
              onClick={async () => {
                await onSave(val);
                setEditing(false);
              }}
            >
              Save
            </button>
            <button
              className="px-2 py-1 rounded border border-gray"
              onClick={() => {
                setVal(item.name || "");
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="px-2 py-1 rounded border border-gray" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="px-2 py-1 rounded border border-gray text-red-600" onClick={onDelete}>
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default function AdminDataEntryPage() {
  const [active, setActive] = useState("location"); // location | skills | industries | study | universities

  // ---------- Shared state ----------
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [skills, setSkills] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [universities, setUniversities] = useState([]);

  // Location data
  const [provinsi, setProvinsi] = useState([]);
  const [kabupaten, setKabupaten] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [selectedProvinsiId, setSelectedProvinsiId] = useState("");
  const [selectedKabupatenId, setSelectedKabupatenId] = useState("");

  // ---------- Fetch bootstrap ----------
  useEffect(() => {
    Promise.all([fetchProvinsi(), fetchSkills(), fetchIndustries(), fetchUniversities(), fetchStudyPrograms()]).catch(() => { });
  }, []);

  // ---------- API fetchers ----------
  async function fetchProvinsi() {
    const { data } = await axiosInstance.get("/admin/provinsi");
    setProvinsi(data || []);
  }
  async function fetchKabupaten(provId) {
    const { data } = await axiosInstance.get(`/admin/kabupaten?provinsi=${provId}`);
    setKabupaten(data || []);
  }
  async function fetchKecamatan(kabId) {
    const { data } = await axiosInstance.get(`/admin/kecamatan?kabupaten=${kabId}`);
    setKecamatan(data || []);
  }

  async function fetchSkills() {
    const { data } = await axiosInstance.get("/admin/skill");
    setSkills(data || []);
  }
  async function fetchIndustries() {
    const { data } = await axiosInstance.get("/admin/industry");
    setIndustries(data || []);
  }
  async function fetchUniversities() {
    const { data } = await axiosInstance.get("/admin/university");
    setUniversities(data || []);
  }
  async function fetchStudyPrograms() {
    const { data } = await axiosInstance.get("/admin/study-program");
    setStudyPrograms(data || []);
  }

  // keep cascades in sync
  useEffect(() => {
    if (selectedProvinsiId) fetchKabupaten(selectedProvinsiId);
  }, [selectedProvinsiId]);
  useEffect(() => {
    if (selectedKabupatenId) fetchKecamatan(selectedKabupatenId);
  }, [selectedKabupatenId]);

  // ---------- LOCATION: sync via SSE ----------
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Idle");
  const [syncData, setSyncData] = useState({
    totals: { provinsi: 0, kabupaten: 0, kecamatan: 0 },
    done: { provinsi: 0, kabupaten: 0, kecamatan: 0 },
    added: { provinsi: 0, kabupaten: 0, kecamatan: 0 },
  });
  const controllerRef = useRef(null);
  const finishedRef = useRef(false);

  const percent = useMemo(() => {
    const t = syncData.totals?.provinsi || 0;
    const d = syncData.done?.provinsi || 0;
    return t ? Math.floor((d / t) * 100) : 0;
  }, [syncData]);

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
    finishedRef.current = false;

    setSyncStatus("Starting…");
    setSyncData({
      totals: { provinsi: 0, kabupaten: 0, kecamatan: 0 },
      done: { provinsi: 0, kabupaten: 0, kecamatan: 0 },
      added: { provinsi: 0, kabupaten: 0, kecamatan: 0 },
    });

    const controller = new AbortController();
    controllerRef.current = controller;

    const token = localStorage.getItem("unicru-token");
    toast.loading("Syncing locations…", { id: "sync" });

    const finish = (ok) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setSyncing(false);
      if (ok) fetchProvinsi();
      try { controllerRef.current?.abort(); } catch { }
      controllerRef.current = null;
    };

    // Build the SSE URL safely (avoids missing/double slashes)
    const sseUrl = new URL("admin/sync-location/new", axiosInstance.defaults.baseURL).toString();

    fetchEventSource(sseUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      signal: controller.signal,
      retry: 0,
      onopen(res) {
        if (res.ok) return;
        throw new Error(`SSE open failed: ${res.status}`);
      },
      onmessage(msg) {
        const { event, data } = msg;
        if (!data) return;
        const payload = JSON.parse(data);

        switch (event) {
          case "start":
            setSyncStatus("Initializing…");
            break;

          case "totals":
            if (payload.totals) {
              setSyncData((p) => ({ ...p, totals: payload.totals })); // <-- fixed spread
            }
            break;

          case "status":
            if (payload.level && payload.name) {
              setSyncStatus(`${payload.level}: ${payload.name}`);
            }
            break;

          case "progress":
            if (payload.done && payload.totals) {
              setSyncData({
                totals: payload.totals,
                done: payload.done,
                added: payload.added || { provinsi: 0, kabupaten: 0, kecamatan: 0 },
              });
            }
            break;

          case "done":
            toast.success(
              `Sync complete. Added P:${payload?.added?.provinsi || 0} ` +
              `KAB:${payload?.added?.kabupaten || 0} KEC:${payload?.added?.kecamatan || 0}`,
              { id: "sync" }
            );
            setSyncStatus("Completed");
            finish(true);
            break;

          case "error":
            toast.error(payload?.message || "Sync failed", { id: "sync" });
            setSyncStatus("Failed");
            finish(false);
            break;

          // optional heartbeats
          case "ping":
          default:
            break;
        }
      },
      onerror(err) {
        if (err?.name === "AbortError") return;
        if (String(err?.message || "").toLowerCase().includes("aborted")) return;
        toast.error("Stream error. Aborting.", { id: "sync" });
        setSyncStatus("Failed");
        finish(false);
      },
    });
  };

  useEffect(() => {
    return () => {
      try {
        controllerRef.current?.abort();
      } catch { }
      controllerRef.current = null;
    };
  }, []);

  // ---------- Mutations (inline) ----------
  async function addSimple(endpoint, name, extra = {}) {
    if (!name?.trim()) return toast.error("Name cannot be empty");
    await axiosInstance.post(endpoint, { name: name.trim(), ...extra });
    toast.success("Added");
  }
  async function updateSimple(endpoint, id, name, extra = {}) {
    if (!name?.trim()) return toast.error("Name cannot be empty");
    await axiosInstance.put(`${endpoint}/${id}`, { name: name.trim(), ...extra });
    toast.success("Updated");
  }
  async function deleteSimple(endpoint, id, label = "item") {
    if (!Confirm(`Delete ${label}? This cannot be undone.`)) return;
    await axiosInstance.delete(`${endpoint}/${id}`);
    toast.success("Deleted");
  }

  // ---------- Tabs ----------
  const tabs = [
    { key: "location", label: "Location" },
    { key: "skills", label: "Skills" },
    { key: "industries", label: "Industries" },
    { key: "study", label: "Study Programs" },
    { key: "universities", label: "Universities" },
  ];

  return (
    <>
      <div className="bg-color-1">

        <div className="mx-auto max-w-6xl p-6 space-y-8 bg-color-1 min-h-[100vh] text-color">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Admin Data Entry</h1>
            <nav className="flex flex-wrap gap-2 text-gray">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={cls(
                    "px-3 py-1.5 rounded-lg border",
                    active === t.key ? "bg-primary text-white border-primary" : "bg-color-2 border-gray"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </header>

          {/* LOCATION TAB */}
          {active === "location" && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* sync card */}
              <div className="space-y-4 border border-gray rounded-xl p-4 bg-color-2">
                <h2 className="text-lg font-semibold">Sync Indonesia Location</h2>
                <p className="text-sm text-gray">
                  Pulls Provinsi → Kabupaten → Kecamatan from the public dataset, streaming progress via SSE.
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={handleSync} disabled={syncing} className="btn-primary text-white px-4 py-2 rounded">
                    {syncing ? "Syncing…" : "🔄 Start Sync"}
                  </button>
                  <span className="text-sm text-gray">{syncStatus}</span>
                </div>
                {syncing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                      <div className="h-2 bg-primary transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="text-xs text-gray">
                      P: {syncData.done.provinsi}/{syncData.totals.provinsi} ·&nbsp;KAB: {syncData.done.kabupaten}/{syncData.totals.kabupaten} ·&nbsp;KEC: {syncData.done.kecamatan}/{syncData.totals.kecamatan}
                    </div>
                  </div>
                )}
              </div>

              {/* add/location card */}
              <div className="space-y-4 border border-gray rounded-xl p-4 bg-color-2">
                <h2 className="text-lg font-semibold">Add Location</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm">Provinsi</label>
                    <select
                      className="w-full rounded border border-gray bg-color-1 text-color px-2 py-2"
                      value={selectedProvinsiId}
                      onChange={(e) => setSelectedProvinsiId(e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {provinsi.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm">Kabupaten</label>
                    <select
                      className="w-full rounded border border-gray bg-color-1 text-color px-2 py-2"
                      value={selectedKabupatenId}
                      onChange={(e) => setSelectedKabupatenId(e.target.value)}
                      disabled={!selectedProvinsiId}
                    >
                      <option value="">— Select —</option>
                      {kabupaten.map((k) => (
                        <option key={k._id} value={k._id}>
                          {k.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <AddLocationBlocks
                  provinsi={provinsi}
                  kabupaten={kabupaten}
                  kecamatan={kecamatan}
                  selectedProvinsiId={selectedProvinsiId}
                  selectedKabupatenId={selectedKabupatenId}
                  onAdded={() => {
                    if (selectedProvinsiId) fetchKabupaten(selectedProvinsiId);
                    if (selectedKabupatenId) fetchKecamatan(selectedKabupatenId);
                    fetchProvinsi();
                  }}
                />
              </div>
            </section>
          )}

          {/* SKILLS TAB */}
          {active === "skills" && (
            <SimpleCrudCard
              title="Skills"
              subtitle="Track reusable skills; users can also propose new ones."
              items={skills}
              columns={[
                { key: "name", label: "Name", width: "w-full" },
                { key: "usageCount", label: "Usage", render: (v) => <Pill>{v || 0}</Pill> },
              ]}
              onAdd={async (name) => {
                await addSimple("/admin/skill", name);
                await fetchSkills();
              }}
              onUpdate={async (id, name) => {
                await updateSimple("/admin/skill", id, name);
                await fetchSkills();
              }}
              onDelete={async (id) => {
                await deleteSimple("/admin/skill", id, "skill");
                await fetchSkills();
              }}
              serverSearchEndpoint="/admin/skill/search"
              searchResultMap={(list) => list}
            />
          )}

          {/* INDUSTRIES TAB */}
          {active === "industries" && (
            <SimpleCrudCard
              title="Industries"
              subtitle="Classify companies and jobs by industry."
              items={industries}
              columns={[{ key: "name", label: "Name", width: "w-full" }]}
              onAdd={async (name) => {
                await addSimple("/admin/industry", name);
                await fetchIndustries();
              }}
              onUpdate={async (id, name) => {
                await updateSimple("/admin/industry", id, name);
                await fetchIndustries();
              }}
              onDelete={async (id) => {
                await deleteSimple("/admin/industry", id, "industry");
                await fetchIndustries();
              }}
              serverSearchEndpoint="/admin/industry/search"
              searchResultMap={(list) => list}
            />
          )}

          {active === "study" && (
            <SimpleCrudCard
              title="Study Programs"
              subtitle="Manage study programs that universities can reference."
              items={studyPrograms}
              columns={[{ key: "name", label: "Name", width: "w-full" }]}
              onAdd={async (name) => {
                await addSimple("/admin/study-program", name);
                await fetchStudyPrograms();
              }}
              onUpdate={async (id, name) => {
                await updateSimple("/admin/study-program", id, name);
                await fetchStudyPrograms();
              }}
              onDelete={async (id) => {
                await deleteSimple("/admin/study-program", id, "study-program");
                await fetchStudyPrograms();
              }}
              serverSearchEndpoint="/admin/study-program/search"
              searchResultMap={(list) => list}
            />
          )}

          {/* UNIVERSITIES TAB */}
          {active === "universities" && (
            <UniversitiesCard
              universities={universities}
              studyPrograms={studyPrograms}
              onAdded={fetchUniversities}
              onDeleted={async (id) => {
                await deleteSimple("/admin/university", id, "university");
                await fetchUniversities();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

/** -------- Reusable CRUD card with search + inline edit -------- */
function SimpleCrudCard({
  title,
  subtitle,
  items,
  columns,
  onAdd,
  onUpdate,
  onDelete,
  serverSearchEndpoint,
  searchResultMap,
}) {
  const [q, setQ] = useState("");
  const [list, setList] = useState(items || []);
  const [newName, setNewName] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => setList(items || []), [items]);

  const clientFiltered = useMemo(() => {
    if (!q.trim() || serverSearchEndpoint) return list;
    const r = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return (list || []).filter((x) => r.test(x?.name || ""));
  }, [q, list, serverSearchEndpoint]);

  async function runServerSearch() {
    if (!serverSearchEndpoint) return;
    setLoadingSearch(true);
    try {
      const { data } = await axiosInstance.get(serverSearchEndpoint, {
        params: { q: q.trim() },
      });
      setList(searchResultMap ? searchResultMap(data || []) : data || []);
    } finally {
      setLoadingSearch(false);
    }
  }

  return (
    <section className="border border-gray rounded-xl bg-color-2 p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="rounded border border-gray bg-color-1 text-color px-2 py-1"
            placeholder={`Search ${title.toLowerCase()}…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && serverSearchEndpoint && runServerSearch()}
          />
          {serverSearchEndpoint && (
            <button onClick={runServerSearch} className="px-3 py-1 rounded border border-gray">
              {loadingSearch ? "…" : "Search"}
            </button>
          )}
        </div>
      </div>

      {/* Add new */}
      <div className="flex items-center gap-2 mb-3">
        <input
          className="flex-1 rounded border border-gray bg-color-1 text-color px-2 py-2"
          placeholder={`New ${title.slice(0, -1)} name`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              await onAdd(newName);
              setNewName("");
            }
          }}
        />
        <button
          className="btn-primary text-white px-4 py-2 rounded"
          onClick={async () => {
            await onAdd(newName);
            setNewName("");
          }}
        >
          Add
        </button>
      </div>

      {/* List */}
      <ul className="divide-y divide-gray border border-gray rounded-lg bg-color-1">
        {(serverSearchEndpoint ? list : clientFiltered).map((it) => (
          <EditableRow
            key={it._id}
            item={it}
            onSave={(name) => onUpdate(it._id, name)}
            onDelete={() => onDelete(it._id)}
            rightNode={columns
              .filter((c) => c.key !== "name")
              .map((c) => (
                <span key={c.key} className={cls("text-xs", c.width)}>
                  {c.render ? c.render(it[c.key], it) : String(it[c.key] ?? "")}
                </span>
              ))}
          />
        ))}
        {(!items || items.length === 0) && <li className="p-3 text-sm text-gray">No items yet.</li>}
      </ul>
    </section>
  );
}

/** -------- Location add blocks -------- */
function AddLocationBlocks({
  provinsi,
  kabupaten,
  kecamatan,
  selectedProvinsiId,
  selectedKabupatenId,
  onAdded,
}) {
  // inputs
  const [pName, setPName] = useState("");
  const [kName, setKName] = useState("");
  const [cName, setCName] = useState("");

  const addP = async () => {
    if (!pName.trim()) return toast.error("Provinsi name required");
    await axiosInstance.post("/admin/provinsi", { name: pName.trim() });
    toast.success("Provinsi added");
    setPName("");
    onAdded?.();
  };
  const addK = async () => {
    if (!kName.trim()) return toast.error("Kabupaten name required");
    if (!selectedProvinsiId) return toast.error("Select Provinsi first");
    await axiosInstance.post("/admin/kabupaten", { name: kName.trim(), provinsi: selectedProvinsiId });
    toast.success("Kabupaten added");
    setKName("");
    onAdded?.();
  };
  const addC = async () => {
    if (!cName.trim()) return toast.error("Kecamatan name required");
    if (!selectedKabupatenId) return toast.error("Select Kabupaten first");
    await axiosInstance.post("/admin/kecamatan", { name: cName.trim(), kabupaten: selectedKabupatenId });
    toast.success("Kecamatan added");
    setCName("");
    onAdded?.();
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="border border-gray rounded-lg p-3 bg-color-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">Provinsi</h3>
          <Pill>{provinsi.length}</Pill>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={pName}
            onChange={(e) => setPName(e.target.value)}
            className="flex-1 rounded border border-gray bg-color-1 text-color px-2 py-2"
            placeholder="New provinsi name"
          />
          <button onClick={addP} className="px-3 py-2 rounded border border-gray">
            Add
          </button>
        </div>
      </div>

      <div className="border border-gray rounded-lg p-3 bg-color-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">Kabupaten</h3>
          <Pill>{kabupaten.length}</Pill>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={kName}
            onChange={(e) => setKName(e.target.value)}
            className="flex-1 rounded border border-gray bg-color-1 text-color px-2 py-2"
            placeholder="New kabupaten name"
          />
          <button onClick={addK} className="px-3 py-2 rounded border border-gray" disabled={!selectedProvinsiId}>
            Add
          </button>
        </div>
      </div>

      <div className="border border-gray rounded-lg p-3 bg-color-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">Kecamatan</h3>
          <Pill>{kecamatan.length}</Pill>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={cName}
            onChange={(e) => setCName(e.target.value)}
            className="flex-1 rounded border border-gray bg-color-1 text-color px-2 py-2"
            placeholder="New kecamatan name"
          />
          <button onClick={addC} className="px-3 py-2 rounded border border-gray" disabled={!selectedKabupatenId}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/** -------- Universities (with specialities multi-select) -------- */
function UniversitiesCard({ universities, studyPrograms, onAdded, onDeleted }) {
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [list, setList] = useState(universities || []);

  // Add form
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]); // study program ids
  const [adding, setAdding] = useState(false);

  // Edit form
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSpecs, setEditSpecs] = useState([]); // study program ids
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!q.trim()) setList(universities || []);
  }, [universities, q]);

  const normalizeIds = (arr) => [...new Set((arr || []).map(String))].sort();
  const arraysEqual = (a, b) => {
    const A = normalizeIds(a);
    const B = normalizeIds(b);
    if (A.length !== B.length) return false;
    for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
    return true;
  };

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(async () => {
      const term = q.trim();
      if (!term) {
        setSearching(false);
        setList(universities || []);
        return;
      }
      try {
        setSearching(true);
        const { data } = await axiosInstance.get("/admin/university/search", { params: { q: term } });
        setList(data || []);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [q, universities]);

  const addUni = async () => {
    const nm = name.trim();
    if (!nm) return toast.error("University name required");
    setAdding(true);
    try {
      const { data: created } = await axiosInstance.post("/admin/university", {
        name: nm,
        speciality: selected,
      });
      toast.success("University added");
      if (!q.trim()) setList((prev) => [created, ...(prev || [])]);
      setName("");
      setSelected([]);
      onAdded?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add university");
    } finally {
      setAdding(false);
    }
  };

  const beginEdit = (u) => {
    setEditingId(u._id);
    setEditName(u.name || "");
    setEditSpecs((u.speciality || []).map((sp) => (typeof sp === "string" ? sp : sp._id)));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditSpecs([]);
    setSaving(false);
  };

  const hasEditChanges = () => {
    const row = list.find((x) => x._id === editingId);
    if (!row) return false;
    const nameChanged = (editName || "").trim() !== (row.name || "");
    const specsChanged = !arraysEqual(
      editSpecs,
      (row.speciality || []).map((sp) => (typeof sp === "string" ? sp : sp._id))
    );
    return nameChanged || specsChanged;
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmed = (editName || "").trim();
    if (!trimmed) return toast.error("Name cannot be empty");
    if (!hasEditChanges()) { cancelEdit(); return; }

    setSaving(true);
    try {
      const { data: updated } = await axiosInstance.put(`/admin/university/${editingId}`, {
        name: trimmed,
        speciality: editSpecs,
      });
      toast.success("University updated");
      setList((prev) => (prev || []).map((x) => (x._id === updated._id ? updated : x)));
      cancelEdit();
      onAdded?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update university");
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this university? This cannot be undone.")) return;
    try {
      await onDeleted?.(id);
      setList((prev) => (prev || []).filter((x) => x._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const selectedCount = selected.length;
  const editSelectedCount = editSpecs.length;

  return (
    <section className="border border-gray rounded-xl bg-color-2 p-4">
      {/* Header + Search */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-color">Universities</h2>
          <p className="text-sm text-gray">Edit names and attach Study Programs as specialities.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              className="rounded border border-gray bg-color-1 text-color px-3 py-2 pr-8"
              placeholder="Search universities…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray hover:text-color"
              >
                ×
              </button>
            )}
          </div>
          <span className="text-xs text-gray border border-gray rounded px-2 py-1">
            {searching ? "Searching…" : `${list.length} result${list.length === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {/* Add new */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input
          className="rounded border border-gray bg-color-1 text-color px-3 py-2"
          placeholder="University name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* NEW: searchable study program selector */}
        <div className="md:col-span-1">
          <StudyProgramMultiSelect
            value={selected}
            onChange={setSelected}
            initialOptions={studyPrograms}
            placeholder="Select specialities…"
          />
          {selectedCount > 0 && (
            <div className="mt-1 text-xs text-gray">{selectedCount} program{selectedCount === 1 ? "" : "s"} selected</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addUni}
            disabled={adding || !name.trim()}
            className="btn-primary text-white rounded px-4 py-2 disabled:opacity-60"
          >
            {adding ? "Adding…" : "Add University"}
          </button>
        </div>
      </div>

      {/* List */}
      <ul className="divide-y divide-gray border border-gray rounded bg-color-1">
        {list.map((uni) => {
          const isEditing = editingId === uni._id;
          return (
            <li key={uni._id} className="p-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  {/* Name */}
                  {isEditing ? (
                    <input
                      className="w-full max-w-md rounded border border-gray bg-color-1 text-color px-3 py-2"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    <div className="font-medium text-color">{uni.name}</div>
                  )}

                  {/* Specialities */}
                  {isEditing ? (
                    <>
                      <div className="mt-2 w-full max-w-md">
                        <StudyProgramMultiSelect
                          value={editSpecs}
                          onChange={setEditSpecs}
                          initialOptions={studyPrograms}
                          placeholder="Edit specialities…"
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray">
                        {editSelectedCount} program{editSelectedCount === 1 ? "" : "s"} selected
                      </div>
                    </>
                  ) : (
                    (uni.speciality?.length > 0) ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {uni.speciality.map((sp) => (
                          <span
                            key={typeof sp === "string" ? sp : sp._id}
                            className="inline-flex items-center rounded-full px-2 py-[2px] text-xs border bg-color-2 text-color border-gray"
                          >
                            {typeof sp === "string" ? sp : sp.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray">No specialities</div>
                    )
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={saving || !hasEditChanges()}
                        className="px-3 py-2 rounded border border-gray bg-color-2 disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={cancelEdit} className="px-3 py-2 rounded border border-gray">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => beginEdit(uni)} className="px-3 py-2 rounded border border-gray">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(uni._id)}
                        className="px-3 py-2 rounded border border-gray text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {list.length === 0 && (
          <li className="p-6 text-sm text-gray">
            {searching ? "Searching…" : q.trim() ? "No results for your search." : "No universities yet."}
          </li>
        )}
      </ul>
    </section>
  );
}


