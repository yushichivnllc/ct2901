import { X, CalendarDays, Check, FileText } from "lucide-react";
import type { AttendanceRecord, Session } from "../utils/helpers";
import { formatDateTime } from "../utils/helpers";
import { Avatar } from "./MyQRCode";
import { findStudentByName } from "../data/classRoster";

interface StudentStatsModalProps {
  studentName: string;
  sessions: Session[];
  onClose: () => void;
}

function getStatusLabel(status: AttendanceRecord["status"] | "missing") {
  if (status === "present") return "Có mặt";
  if (status === "absent-excused") return "Vắng có phép";
  return "Vắng không phép";
}

function getStatusClass(status: AttendanceRecord["status"] | "missing") {
  if (status === "present") return "bg-[color:var(--teal)] text-[#08383d]";
  if (status === "absent-excused") return "bg-[color:var(--amber)] text-[color:var(--ink)]";
  return "bg-[color:var(--rose)] text-white";
}

export function StudentStatsModal({
  studentName,
  sessions,
  onClose,
}: StudentStatsModalProps) {
  const savedSessions = sessions.filter((s) => s.savedAt);
  const student = findStudentByName(studentName);

  const rows = savedSessions.map((session) => {
    const record = session.records.find(
      (r) => r.name.toLowerCase() === studentName.toLowerCase(),
    );
    const status: AttendanceRecord["status"] | "missing" =
      record?.status ?? "missing";
    return {
      session,
      record,
      status,
    };
  });

  const present = rows.filter((r) => r.status === "present").length;
  const excused = rows.filter((r) => r.status === "absent-excused").length;
  const unexcused = rows.length - present - excused;
  const rate = Math.round((present / Math.max(rows.length, 1)) * 100);

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card-pin relative max-h-[92vh] w-full max-w-xl overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={studentName} size={48} />
            <div className="min-w-0">
              <p className="truncate font-comic text-xl">{studentName}</p>
              <p className="font-round text-xs font-medium text-[color:var(--ink-faint)]">
                {student ? `${student.maSV} · ` : ""}Thống kê từ {savedSessions.length} phiên đã lưu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-glass flex h-10 w-10 items-center justify-center rounded-2xl !p-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-5 pt-0">
          <div className="mb-4 grid grid-cols-4 gap-2">
            <div className="card-pin p-3 text-center">
              <p className="font-comic text-2xl">{rate}%</p>
              <p className="font-round text-[11px] font-bold text-[color:var(--ink-faint)]">
                Tỉ lệ
              </p>
            </div>
            <div className="card-nb-mint rounded-[20px] p-3 text-center">
              <Check className="mx-auto h-4 w-4" />
              <p className="font-comic text-2xl">{present}</p>
              <p className="font-round text-[11px] font-bold">Có</p>
            </div>
            <div className="card-nb-pink rounded-[20px] p-3 text-center">
              <X className="mx-auto h-4 w-4" />
              <p className="font-comic text-2xl">{unexcused}</p>
              <p className="font-round text-[11px] font-bold">KP</p>
            </div>
            <div className="card-nb-yellow rounded-[20px] p-3 text-center">
              <FileText className="mx-auto h-4 w-4" />
              <p className="font-comic text-2xl">{excused}</p>
              <p className="font-round text-[11px] font-bold">CP</p>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-[22px] border-[2.5px] border-dashed border-[color:var(--ink)] bg-white px-4 py-10 text-center">
              <p className="font-round text-sm font-semibold text-[color:var(--ink-faint)]">
                Chưa có phiên đã lưu để thống kê học sinh này.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...rows].reverse().map(({ session, record, status }) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-[22px] border-[2.5px] border-[color:var(--ink)] bg-white p-3"
                >
                  <CalendarDays className="h-4 w-4 shrink-0 text-[color:var(--ink-faint)]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-round text-sm font-bold text-[color:var(--ink)]">
                      {formatDateTime(session.savedAt ?? session.createdAt)}
                    </p>
                    <p className="font-round text-xs text-[color:var(--ink-faint)]">
                      Ghi nhận: {record ? formatDateTime(record.timestamp) : "Tự chốt khi lưu"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border-[2px] border-[color:var(--ink)] px-3 py-1 font-round text-xs font-bold ${getStatusClass(status)}`}
                  >
                    {getStatusLabel(status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}