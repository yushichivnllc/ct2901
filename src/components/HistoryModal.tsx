import { useState } from "react";
import { X, ChevronRight, Users, ArrowLeft, CalendarDays, Clock } from "lucide-react";
import type { Session } from "../utils/helpers";
import { formatDateTime } from "../utils/helpers";
import { Avatar } from "./MyQRCode";
import { CLASS_ROSTER } from "../data/classRoster";

interface HistoryModalProps {
  sessions: Session[];
  onClose: () => void;
}

export function HistoryModal({ sessions, onClose }: HistoryModalProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const sortedSessions = [...sessions].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="card-pin relative max-h-[92vh] w-full max-w-2xl overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            {selectedSession && (
              <button
                onClick={() => setSelectedSession(null)}
                className="btn-circle !h-10 !w-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <p className="font-comic text-xl">
                {selectedSession ? "Chi tiết phiên" : "Lịch sử điểm danh"}
              </p>
              <p className="font-round text-xs font-medium text-[color:var(--ink-faint)]">
                {selectedSession
                  ? formatDateTime(selectedSession.createdAt)
                  : `${sortedSessions.length} phiên đã lưu`}
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

        <div className="max-h-[70vh] overflow-y-auto p-5 pt-0">
          {!selectedSession ? (
            sortedSessions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-comic text-xl">Chưa có phiên nào</p>
                <p className="mt-1 font-round text-sm text-[color:var(--ink-faint)]">
                  Bắt đầu phiên điểm danh đầu tiên nhé!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedSessions.map((session, idx) => {
                  const present = session.records.filter(
                    (r) => r.status === "present",
                  ).length;
                  const absent = CLASS_ROSTER.length - present;
                  const excusedN = session.records.filter(
                    (r) => r.status === "absent-excused",
                  ).length;
                  const pct = Math.round((present / CLASS_ROSTER.length) * 100);
                  const stripe =
                    pct >= 80
                      ? "stripe-teal"
                      : pct >= 50
                        ? "stripe-amber"
                        : "stripe-rose";

                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`card-pin ${idx % 2 ? "card-pin-alt" : ""} ${stripe} w-full p-4 text-left`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-[color:var(--ink)] bg-[color:var(--amber)] font-comic text-lg">
                            {pct}%
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 shrink-0 text-[color:var(--ink-faint)]" />
                              <p className="truncate font-round text-sm font-bold">
                                {formatDateTime(session.createdAt)}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center gap-3 font-round text-xs font-bold text-[color:var(--ink-faint)]">
                              <span>{present} có mặt</span>
                              <span>{absent} vắng</span>
                              {excusedN > 0 && <span>{excusedN} có phép</span>}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="space-y-4">
              {(() => {
                const presentList = selectedSession.records.filter(
                  (r) => r.status === "present",
                );
                const excusedList = selectedSession.records.filter(
                  (r) => r.status === "absent-excused",
                );
                const unexcusedMarked = selectedSession.records.filter(
                  (r) => r.status === "absent-unexcused",
                );
                const notMarked = CLASS_ROSTER.filter(
                  (n) =>
                    !selectedSession.records.some(
                      (r) => r.name.toLowerCase() === n.toLowerCase(),
                    ),
                );
                const unexcusedNames = [
                  ...unexcusedMarked.map((r) => r.name),
                  ...notMarked,
                ];

                return (
                  <>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="card-pin p-3 text-center">
                        <Users className="mx-auto h-4 w-4" />
                        <p className="mt-1 font-comic text-2xl">
                          {CLASS_ROSTER.length}
                        </p>
                        <p className="font-round text-[11px] font-bold">Sĩ số</p>
                      </div>
                      <div className="card-nb-mint rounded-[20px] p-3 text-center">
                        <p className="font-comic text-2xl">{presentList.length}</p>
                        <p className="font-round text-[11px] font-bold">Có mặt</p>
                      </div>
                      <div className="card-nb-pink rounded-[20px] p-3 text-center">
                        <p className="font-comic text-2xl">
                          {unexcusedNames.length}
                        </p>
                        <p className="font-round text-[11px] font-bold">Vắng KP</p>
                      </div>
                      <div className="card-nb-yellow rounded-[20px] p-3 text-center">
                        <p className="font-comic text-2xl">{excusedList.length}</p>
                        <p className="font-round text-[11px] font-bold">Vắng CP</p>
                      </div>
                    </div>

                    <div className="card-nb-pink rounded-[22px] p-4">
                      <h3 className="mb-3 font-comic text-lg">
                        Vắng không phép ({unexcusedNames.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {unexcusedNames.length === 0 ? (
                          <p className="font-round text-sm font-bold">
                            Không có ai vắng không phép!
                          </p>
                        ) : (
                          unexcusedNames.map((name) => (
                            <div
                              key={name}
                              className="flex items-center gap-2 rounded-full border-2 border-[color:var(--ink)] bg-white px-3 py-1.5"
                            >
                              <Avatar name={name} size={22} />
                              <span className="font-round text-xs font-bold">
                                {name}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="card-nb-yellow rounded-[22px] p-4">
                      <h3 className="mb-3 font-comic text-lg">
                        Vắng có phép ({excusedList.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {excusedList.length === 0 ? (
                          <p className="font-round text-sm font-bold">
                            Không có ai vắng có phép.
                          </p>
                        ) : (
                          excusedList.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center gap-2 rounded-full border-2 border-[color:var(--ink)] bg-white px-3 py-1.5"
                            >
                              <Avatar name={r.name} size={22} />
                              <span className="font-round text-xs font-bold">
                                {r.name}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}

              <div>
                <h3 className="mb-3 font-comic text-lg">Có mặt</h3>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {selectedSession.records.filter((r) => r.status === "present")
                    .length === 0 && (
                    <p className="py-4 text-center font-round text-sm font-bold text-[color:var(--ink-faint)]">
                      Chưa có ai được đánh dấu có mặt.
                    </p>
                  )}
                  {[...selectedSession.records]
                    .filter((r) => r.status === "present")
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((record, idx) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-3 rounded-[20px] border-[2.5px] border-[color:var(--ink)] bg-white p-2.5"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--teal)] font-comic text-sm">
                          {idx + 1}
                        </div>
                        <Avatar name={record.name} size={36} />
                        <p className="flex-1 truncate font-round text-sm font-bold">
                          {record.name}
                        </p>
                        <span className="flex items-center gap-1 font-round text-xs font-bold text-[color:var(--ink-faint)]">
                          <Clock className="h-3 w-3" />
                          {new Date(record.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
