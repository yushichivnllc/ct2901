import { BarChart3, ChevronRight } from "lucide-react";
import type { Session } from "../utils/helpers";
import { CLASS_ROSTER, findStudentByName } from "../data/classRoster";
import { Avatar } from "./MyQRCode";

interface StudentStatsTableProps {
  sessions: Session[];
  onOpenStudentStats: (name: string) => void;
}

function getStudentStats(name: string, savedSessions: Session[]) {
  return savedSessions.reduce(
    (acc, session) => {
      const record = session.records.find(
        (r) => r.name.toLowerCase() === name.toLowerCase(),
      );
      if (!record) acc.unexcused += 1;
      else if (record.status === "present") acc.present += 1;
      else if (record.status === "absent-excused") acc.excused += 1;
      else acc.unexcused += 1;
      return acc;
    },
    { present: 0, excused: 0, unexcused: 0 },
  );
}

export function StudentStatsTable({
  sessions,
  onOpenStudentStats,
}: StudentStatsTableProps) {
  const savedSessions = sessions.filter((s) => s.savedAt);

  return (
    <div className="card-pin p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-comic text-lg">Bảng thống kê học sinh</p>
          <p className="font-round text-xs font-medium text-[color:var(--ink-faint)]">
            {savedSessions.length > 0
              ? `${savedSessions.length} phiên đã lưu (đồng bộ từ tất cả cán bộ), bấm vào học sinh để xem chi tiết`
              : "Chưa có phiên nào được lưu"}
          </p>
        </div>
        <BarChart3 className="h-5 w-5 text-[color:var(--ink-faint)]" />
      </div>

      {savedSessions.length === 0 ? (
        <div className="rounded-[22px] border-[2.5px] border-dashed border-[color:var(--ink)] bg-white px-4 py-8 text-center">
          <p className="font-round text-sm font-semibold text-[color:var(--ink-faint)]">
            Hãy bấm "Lưu điểm danh" sau khi chốt phiên để tạo thống kê.
          </p>
        </div>
      ) : (
        <div className="max-h-[430px] overflow-y-auto pr-1">
          <table className="w-full border-separate border-spacing-y-2 text-left">
            <thead>
              <tr className="font-round text-[11px] uppercase text-[color:var(--ink-faint)]">
                <th className="px-2 font-bold">Học sinh</th>
                <th className="px-2 text-center font-bold">Có</th>
                <th className="px-2 text-center font-bold">KP</th>
                <th className="px-2 text-center font-bold">CP</th>
                <th className="px-2 text-right font-bold">Tỉ lệ</th>
              </tr>
            </thead>
            <tbody>
              {CLASS_ROSTER.map((name) => {
                const stats = getStudentStats(name, savedSessions);
                const student = findStudentByName(name);
                const rate = Math.round(
                  (stats.present / Math.max(savedSessions.length, 1)) * 100,
                );
                return (
                  <tr key={name}>
                    <td colSpan={5} className="p-0">
                      <button
                        onClick={() => onOpenStudentStats(name)}
                        className="grid w-full grid-cols-[1fr_40px_40px_40px_58px_20px] items-center gap-1 rounded-[22px] border-[2.5px] border-[color:var(--ink)] bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Avatar name={name} size={34} />
                          <span className="min-w-0">
                            <span className="block truncate font-round text-sm font-bold text-[color:var(--ink)]">
                              {name}
                            </span>
                            {student && (
                              <span className="block truncate font-round text-[11px] font-semibold text-[color:var(--ink-faint)]">
                                {student.maSV}
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="text-center font-round text-xs font-bold text-[color:var(--teal-deep)]">
                          {stats.present}
                        </span>
                        <span className="text-center font-round text-xs font-bold text-[color:var(--rose)]">
                          {stats.unexcused}
                        </span>
                        <span className="text-center font-round text-xs font-bold text-[color:var(--amber-deep)]">
                          {stats.excused}
                        </span>
                        <span className="text-right font-round text-xs font-bold text-[color:var(--ink)]">
                          {rate}%
                        </span>
                        <ChevronRight className="h-4 w-4 text-[color:var(--ink-faint)]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}