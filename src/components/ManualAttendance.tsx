import { useMemo, useState } from "react";
import {
  Search,
  Check,
  X,
  FileText,
  RotateCcw,
  CheckCheck,
} from "lucide-react";
import { Avatar } from "./MyQRCode";
import type { AttendanceRecord, Session } from "../utils/helpers";
import { CLASS_ROSTER, findStudentByName } from "../data/classRoster";

type Status = AttendanceRecord["status"];
type FilterKey = "all" | "unmarked" | Status;

interface ManualAttendanceProps {
  currentSession: Session | null;
  onSetStatus: (name: string, status: Status | null) => void;
  onSetAllStatus: (names: string[], status: Status) => void;
  onToast: (t: { type: "success" | "error" | "info"; message: string }) => void;
}

const STATUS_META: Record<
  Status,
  { label: string; icon: any; bg: string; text: string; ring: string }
> = {
  present: {
    label: "Có mặt",
    icon: Check,
    bg: "var(--teal)",
    text: "#08383d",
    ring: "var(--teal)",
  },
  "absent-unexcused": {
    label: "Vắng KP",
    icon: X,
    bg: "var(--rose)",
    text: "#fff",
    ring: "var(--rose)",
  },
  "absent-excused": {
    label: "Vắng CP",
    icon: FileText,
    bg: "var(--amber)",
    text: "#1c1c1c",
    ring: "var(--amber)",
  },
};

export function ManualAttendance({
  currentSession,
  onSetStatus,
  onSetAllStatus,
  onToast,
}: ManualAttendanceProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const statusMap = useMemo(() => {
    const map = new Map<string, Status>();
    currentSession?.records.forEach((r) => {
      map.set(r.name.toLowerCase(), r.status);
    });
    return map;
  }, [currentSession]);

  const getStatus = (name: string): Status | undefined =>
    statusMap.get(name.toLowerCase());

  const counts = useMemo(() => {
    let present = 0;
    let unexcused = 0;
    let excused = 0;
    CLASS_ROSTER.forEach((n) => {
      const s = getStatus(n);
      if (s === "present") present++;
      else if (s === "absent-unexcused") unexcused++;
      else if (s === "absent-excused") excused++;
    });
    return {
      present,
      unexcused,
      excused,
      unmarked: CLASS_ROSTER.length - present - unexcused - excused,
    };
  }, [statusMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CLASS_ROSTER.filter((name) => {
      if (q && !name.toLowerCase().includes(q)) return false;
      const s = getStatus(name);
      if (filter === "all") return true;
      if (filter === "unmarked") return s === undefined;
      return s === filter;
    });
  }, [query, filter, statusMap]);

  const disabled = !currentSession;

  const handleClick = (name: string, status: Status) => {
    if (disabled) {
      onToast({
        type: "info",
        message: "Hãy bắt đầu một phiên điểm danh trước!",
      });
      return;
    }
    const current = getStatus(name);
    onSetStatus(name, current === status ? null : status);
  };

  const filterChips: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "Tất cả", count: CLASS_ROSTER.length },
    { key: "present", label: "Có mặt", count: counts.present },
    { key: "absent-unexcused", label: "Vắng KP", count: counts.unexcused },
    { key: "absent-excused", label: "Vắng CP", count: counts.excused },
    { key: "unmarked", label: "Chưa ĐD", count: counts.unmarked },
  ];

  return (
    <div className="card-pin p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-comic text-lg">Điểm danh thủ công</p>
          <p className="font-round text-xs text-[color:var(--ink-faint)]">
            Tick có mặt / vắng không phép / vắng có phép
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (disabled) {
                onToast({
                  type: "info",
                  message: "Hãy bắt đầu một phiên điểm danh trước!",
                });
                return;
              }
              onSetAllStatus(CLASS_ROSTER, "present");
              onToast({ type: "success", message: "Đã đánh dấu cả lớp có mặt!" });
            }}
            className="btn-glass rounded-2xl px-3 py-2 font-round text-xs font-bold"
          >
            <CheckCheck className="mr-1 inline h-4 w-4" />
            Tất cả có mặt
          </button>
          <button
            onClick={() => {
              if (disabled) return;
              const unmarked = CLASS_ROSTER.filter((n) => !getStatus(n));
              if (unmarked.length === 0) {
                onToast({ type: "info", message: "Không còn ai chưa điểm danh!" });
                return;
              }
              onSetAllStatus(unmarked, "absent-unexcused");
              onToast({
                type: "info",
                message: `${unmarked.length} bạn còn lại → Vắng không phép`,
              });
            }}
            className="btn-glass rounded-2xl px-3 py-2 font-round text-xs font-bold"
          >
            <RotateCcw className="mr-1 inline h-4 w-4" />
            Còn lại vắng
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-faint)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm học sinh..."
          className="input-nb pl-11 font-round"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {filterChips.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className="rounded-full border-[2px] px-3 py-1.5 font-round text-xs font-bold"
              style={{
                borderColor: "var(--ink)",
                background: active ? "var(--amber)" : "#fff",
                color: "var(--ink)",
              }}
            >
              {c.label}
              <span className="ml-1.5 opacity-70">{c.count}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-[#eceef4]">
        <div
          className="h-full bg-[color:var(--teal)]"
          style={{ width: `${(counts.present / CLASS_ROSTER.length) * 100}%` }}
        />
        <div
          className="h-full bg-[color:var(--amber)]"
          style={{ width: `${(counts.excused / CLASS_ROSTER.length) * 100}%` }}
        />
        <div
          className="h-full bg-[color:var(--rose)]"
          style={{ width: `${(counts.unexcused / CLASS_ROSTER.length) * 100}%` }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center">
          <p className="font-comic text-lg">Không tìm thấy học sinh</p>
        </div>
      ) : (
        <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
          {filtered.map((name, idx) => {
            const status = getStatus(name);
            const meta = status ? STATUS_META[status] : null;
            const student = findStudentByName(name);
            return (
              <div
                key={name}
                className="flex items-center gap-3 rounded-[22px] border-[2.5px] border-[color:var(--ink)] bg-white p-2.5"
              >
                <span className="w-5 text-center font-round text-xs font-bold text-[color:var(--ink-faint)]">
                  {idx + 1}
                </span>
                <Avatar name={name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-round text-sm font-bold text-[color:var(--ink)]">
                    {name}
                  </p>
                  <p className="font-round text-[11px] text-[color:var(--ink-faint)]">
                    {student?.maSV ?? ""} {student ? "·" : ""} {meta ? meta.label : "Chưa điểm danh"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {(["present", "absent-unexcused", "absent-excused"] as Status[]).map(
                    (s) => {
                      const m = STATUS_META[s];
                      const Icon = m.icon;
                      const active = status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => handleClick(name, s)}
                          title={m.label}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-[color:var(--ink)]"
                          style={{
                            background: active ? m.bg : "#fff",
                            color: active ? m.text : "var(--ink-faint)",
                          }}
                        >
                          <Icon className="h-4 w-4" strokeWidth={3} />
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-dashed border-[#ddd] pt-3">
        {(["present", "absent-unexcused", "absent-excused"] as Status[]).map((s) => {
          const m = STATUS_META[s];
          const Icon = m.icon;
          return (
            <span
              key={s}
              className="flex items-center gap-1.5 font-round text-[11px] font-bold text-[color:var(--ink-soft)]"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-md border border-[color:var(--ink)]"
                style={{ background: m.bg, color: m.text }}
              >
                <Icon className="h-3 w-3" strokeWidth={3} />
              </span>
              {m.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
