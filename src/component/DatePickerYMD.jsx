import { useEffect, useMemo, useRef, useState } from "react";

// Utilities
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const clampDate = (d, min, max) => new Date(Math.min(Math.max(d.getTime(), min.getTime()), max.getTime()));
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function daysInMonth(year, monthIndex) { return new Date(year, monthIndex + 1, 0).getDate(); }
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function addMonths(date, n) { const d = new Date(date); d.setMonth(d.getMonth() + n); return d; }
function isBetween(d, min, max) { const t = d.setHours(0,0,0,0); return t >= min.setHours(0,0,0,0) && t <= max.setHours(0,0,0,0); }

export default function DatePickerYMD({
  value, onChange, minDate, maxDate,
  placeholder = "Select date",
  yearWindow = 25,
  className = "",
}) {
  const parsed = value ? new Date(value) : null;
  const today = new Date();
  const min = minDate ?? new Date(1900, 0, 1);
  const max = maxDate ?? new Date(2100, 11, 31);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState("day"); // "day" | "month" | "year"
  const [cursor, setCursor] = useState(() => clampDate(parsed ?? today, min, max));

  useEffect(() => { if (parsed) setCursor(clampDate(parsed, min, max)); }, [value]); // eslint-disable-line

  const years = useMemo(() => {
    const cy = cursor.getFullYear();
    const start = Math.max(min.getFullYear(), cy - yearWindow);
    const end = Math.min(max.getFullYear(), cy + yearWindow);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [cursor, min, max, yearWindow]);

  // close on outside click
  const popRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  // keyboard
  const containerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e) => {
      if (view !== "day") return;
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const delta = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" ? -7 : 7;
        setCursor((c) => clampDate(addDaysSafe(c, delta), min, max));
      } else if (e.key === "PageUp") {
        e.preventDefault(); setCursor((c) => clampDate(addMonths(c, e.shiftKey ? -12 : -1), min, max));
      } else if (e.key === "PageDown") {
        e.preventDefault(); setCursor((c) => clampDate(addMonths(c, e.shiftKey ? 12 : 1), min, max));
      } else if (e.key === "Enter") {
        e.preventDefault(); if (isBetween(cursor, min, max)) commit(cursor);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", fn);
    return () => el?.removeEventListener("keydown", fn);
  }, [open, view, cursor, min, max]);

  function addDaysSafe(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
  function commit(d) { const c = clampDate(d, min, max); onChange?.(toISO(c)); setOpen(false); }

  const monthNames = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString(undefined, { month: "short" })),
    []
  );

  const goPrevMonth = () => setCursor((c) => clampDate(addMonths(c, -1), min, max));
  const goNextMonth = () => setCursor((c) => clampDate(addMonths(c, +1), min, max));
  const goPrevYear = () => setCursor((c) => clampDate(addMonths(c, -12), min, max));
  const goNextYear = () => setCursor((c) => clampDate(addMonths(c, +12), min, max));
  const goPrevDecade = () => setCursor((c) => new Date(Math.max(min, new Date(c.getFullYear() - 10, c.getMonth(), 1))));
  const goNextDecade = () => setCursor((c) => new Date(Math.min(max, new Date(c.getFullYear() + 10, c.getMonth(), 1))));

  // day grid precompute (for DayView too)
  startOfMonth(cursor);
  daysInMonth(cursor.getFullYear(), cursor.getMonth());

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-gray bg-color-1 text-color px-3 py-2 rounded-lg flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
      >
        <span className={value ? "" : "text-gray"}>{value || placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-70">
          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={popRef}
          role="dialog"
          aria-label="Date picker"
          className="absolute z-50 mt-2 w-80 rounded-xl border border-gray bg-color-2 text-color shadow-xl p-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1">
              <IconBtn onClick={goPrevDecade} title="Previous decade">«</IconBtn>
              <IconBtn onClick={goPrevYear} title="Previous year">‹Y</IconBtn>
              <IconBtn onClick={goPrevMonth} title="Previous month">‹</IconBtn>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2 py-1 rounded-md hover-bg-highlight transition font-medium"
                onClick={() => setView(view === "month" ? "day" : "month")}
              >
                {monthNames[cursor.getMonth()]}
              </button>
              <button
                type="button"
                className="px-2 py-1 rounded-md hover-bg-highlight transition font-medium"
                onClick={() => setView(view === "year" ? "day" : "year")}
              >
                {cursor.getFullYear()}
              </button>
            </div>

            <div className="flex gap-1">
              <IconBtn onClick={goNextMonth} title="Next month">›</IconBtn>
              <IconBtn onClick={goNextYear} title="Next year">Y›</IconBtn>
              <IconBtn onClick={goNextDecade} title="Next decade">»</IconBtn>
            </div>
          </div>

          {/* Views */}
          {view === "day" && (
            <DayView
              cursor={cursor}
              setCursor={setCursor}
              min={min}
              max={max}
              onPick={commit}
            />
          )}

          {view === "month" && (
            <MonthView
              cursor={cursor}
              setCursor={setCursor}
              min={min}
              max={max}
              monthNames={monthNames}
              onDone={() => setView("day")}
            />
          )}

          {view === "year" && (
            <YearView
              cursor={cursor}
              setCursor={setCursor}
              min={min}
              max={max}
              years={years}
              onDone={() => setView("day")}
            />
          )}

          {/* Footer */}
          <div className="flex justify-between mt-3">
            <button
              type="button"
              className="text-sm px-2 py-1 rounded-md hover-bg-highlight transition"
              onClick={() => {
                const t = clampDate(today, min, max);
                setCursor(t);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className="text-sm px-2 py-1 rounded-md hover-bg-highlight transition"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({ onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-7 h-7 grid place-items-center rounded-md hover-bg-highlight transition"
    >
      <span className="text-sm">{children}</span>
    </button>
  );
}

function DayView({ cursor, setCursor, min, max, onPick }) {
  const first = startOfMonth(cursor);
  const firstWeekday = (first.getDay() + 7) % 7;
  const totalDays = daysInMonth(cursor.getFullYear(), cursor.getMonth());

  const grid = [];
  for (let i = 0; i < firstWeekday; i++) grid.push(null);
  for (let d = 1; d <= totalDays; d++) grid.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));

  const weekLabels = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  return (
    <>
      <div className="grid grid-cols-7 text-center text-xs text-gray mb-1 select-none">
        {weekLabels.map((w) => <div key={w} className="py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          if (!d) return <div key={i} />;
          const disabled = !isBetween(new Date(d), min, max);
          const isToday = sameDay(d, new Date());
          const isCursor = sameDay(d, cursor);

          return (
            <button
              type="button"
              key={i}
              disabled={disabled}
              onClick={() => onPick(d)}
              onMouseEnter={() => setCursor(d)}
              className={[
                "h-9 rounded-md text-sm transition border",
                disabled ? "text-gray border-transparent cursor-not-allowed" :
                "hover-bg-highlight",
                isToday ? "border-primary" : "border-transparent",
                isCursor ? "bg-primary text-color-white hover-bg-primary" : ""
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
}

function MonthView({ cursor, setCursor, min, max, monthNames, onDone }) {
  const canPickMonth = (y, m) => {
    const start = new Date(y, m, 1);
    const end = new Date(y, m, daysInMonth(y, m));
    return isBetween(start, min, max) || isBetween(end, min, max) || (start < min && end > min) || (start < max && end > max);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {monthNames.map((mn, m) => {
        const y = cursor.getFullYear();
        const disabled = !canPickMonth(y, m);
        return (
          <button
            type="button"
            key={mn}
            disabled={disabled}
            className={[
              "py-2 rounded-md text-sm border transition",
              disabled
                ? "text-gray border-transparent cursor-not-allowed"
                : "border border-gray hover-bg-highlight"
            ].join(" ")}
            onClick={() => {
              const next = new Date(y, m, 1);
              setCursor(next);
              onDone?.();
            }}
          >
            {mn}
          </button>
        );
      })}
    </div>
  );
}

function YearView({ cursor, setCursor, min, max, years, onDone }) {
  const [search, setSearch] = useState("");
  const listRef = useRef(null);

  const filtered = years.filter((y) => String(y).includes(search));

  useEffect(() => {
    const idx = filtered.indexOf(cursor.getFullYear());
    if (idx >= 0) {
      const el = listRef.current?.children?.[idx];
      el?.scrollIntoView({ block: "center" });
    }
  }, [cursor, filtered]);

  const pickYear = (y) => {
    const next = new Date(y, cursor.getMonth(), 1);
    const clamped = clampDate(next, min, max);
    setCursor(clamped);
    onDone?.();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} // prevent form submit
        placeholder="Type year…"
        inputMode="numeric"
        className="w-full border border-gray bg-color-1 text-color rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
      />
      <div ref={listRef} className="max-h-56 overflow-auto rounded-md border border-gray p-1 space-y-1 bg-color-1">
        {filtered.map((y) => {
          const disabled = y < min.getFullYear() || y > max.getFullYear();
          const isCurr = y === cursor.getFullYear();
          return (
            <button
              type="button"
              key={y}
              disabled={disabled}
              onClick={() => !disabled && pickYear(y)}
              className={[
                "w-full text-left px-2 py-1 rounded-md text-sm transition",
                disabled ? "text-gray cursor-not-allowed" : "hover-bg-highlight",
                isCurr ? "bg-primary text-color-white hover-bg-primary" : ""
              ].join(" ")}
            >
              {y}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray">
        <span>Tip: Shift+PgUp/PgDn jumps years in Day view.</span>
        <span>{min.getFullYear()}–{max.getFullYear()}</span>
      </div>
    </div>
  );
}
