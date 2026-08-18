import { useState, useEffect, useCallback, useRef } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { MainScreen } from "./components/MainScreen";
import { HistoryModal } from "./components/HistoryModal";
import { MyQRModal } from "./components/MyQRModal";
import { StudentStatsModal } from "./components/StudentStatsModal";
import { ZaloReportModal } from "./components/ZaloReportModal";
import { DeleteDataModal } from "./components/DeleteDataModal";
import { AccessDeniedScreen } from "./components/AccessDeniedScreen";
import { Toast, type ToastMessage } from "./components/Toast";
import type { Session, AttendanceRecord } from "./utils/helpers";
import { CLASS_ROSTER, CAN_BO_LOP } from "./data/classRoster";
import {
  saveAttendanceToDatabase,
  saveAttendanceHistory,
  saveStudentStatistics,
  syncSessionsFromDatabase,
} from "./utils/database";

const STORAGE_KEY = "dd-comic-user";
const SESSIONS_KEY = "dd-comic-sessions";

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isCanBo, setIsCanBo] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "history" | "myqr" | "zalo-report" | "delete-data">(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUserName(savedUser);
      setIsCanBo(CAN_BO_LOP.includes(savedUser));
    }

    const savedSessions = localStorage.getItem(SESSIONS_KEY);
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions) as {
          sessions: Session[];
          currentId: string | null;
        };
        setSessions(parsed.sessions);
        setCurrentSessionId(parsed.currentId);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(
      SESSIONS_KEY,
      JSON.stringify({ sessions, currentId: currentSessionId }),
    );
  }, [sessions, currentSessionId]);

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsCanBo(CAN_BO_LOP.includes(name));
    localStorage.setItem(STORAGE_KEY, name);
  };

  // Đồng bộ phiên điểm danh của tất cả cán bộ lớp từ Supabase
  const isSyncingRef = useRef(false);
  const syncFromDatabase = useCallback(async (silent: boolean) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await syncSessionsFromDatabase();
      if (!result.success || !result.data) {
        if (!silent) {
          setToast({
            type: "error",
            message: result.error || "Lỗi đồng bộ dữ liệu",
          });
        }
        return;
      }

      const remoteSessions = result.data;

      setSessions((prev) => {
        const byRemoteId = new Map<string, Session>();
        prev.forEach((s) => {
          if (s.remoteId) byRemoteId.set(s.remoteId, s);
        });

        const merged: Session[] = [];
        const keptLocalIds = new Set<string>();

        remoteSessions.forEach((rs) => {
          const local = rs.remoteId
            ? byRemoteId.get(rs.remoteId)
            : undefined;
          if (local) {
            keptLocalIds.add(local.id);
            // Giữ id local để không mất currentSessionId đang chọn
            merged.push({ ...rs, id: local.id });
          } else {
            merged.push(rs);
          }
        });

        // Giữ lại phiên local chưa có trên server (nháp / lưu offline)
        prev.forEach((s) => {
          if (!s.remoteId) merged.push(s);
        });

        return merged;
      });

      if (!silent) {
        setToast({
          type: "success",
          message: `🔄 Đã đồng bộ ${remoteSessions.length} phiên điểm danh từ hệ thống.`,
        });
      }
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  // Tự tải dữ liệu chung khi đăng nhập
  useEffect(() => {
    if (!userName || !isCanBo) return;
    syncFromDatabase(true);
  }, [userName, isCanBo, syncFromDatabase]);

  const handleLogout = () => {
    setUserName(null);
    setIsCanBo(false);
    localStorage.removeItem(STORAGE_KEY);
    setModal(null);
  };

  const handleStartSession = useCallback(() => {
    const newSession: Session = {
      id: Math.random().toString(36).substring(2, 15),
      name: `Phiên ${new Date().toLocaleString("vi-VN")}`,
      createdAt: Date.now(),
      records: [],
      recordedBy: userName ?? undefined,
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setToast({ type: "success", message: "🚀 Phiên điểm danh đã bắt đầu!" });
  }, [userName]);

  const handleScan = useCallback(
    (record: AttendanceRecord) => {
      if (!currentSessionId) return;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, records: [...s.records, record] }
            : s,
        ),
      );
    },
    [currentSessionId],
  );

  // Điểm danh thủ công: đặt / bỏ trạng thái cho 1 học sinh
  const handleSetStatus = useCallback(
    (name: string, status: AttendanceRecord["status"] | null) => {
      if (!currentSessionId) return;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSessionId) return s;

          const idx = s.records.findIndex(
            (r) => r.name.toLowerCase() === name.toLowerCase(),
          );

          // Bỏ trạng thái -> xoá bản ghi
          if (status === null) {
            if (idx === -1) return s;
            return {
              ...s,
              records: s.records.filter((_, i) => i !== idx),
            };
          }

          // Đã có -> cập nhật
          if (idx !== -1) {
            const records = [...s.records];
            records[idx] = {
              ...records[idx],
              status,
              timestamp: Date.now(),
            };
            return { ...s, records };
          }

          // Chưa có -> thêm mới
          return {
            ...s,
            records: [
              ...s.records,
              {
                id: Math.random().toString(36).substring(2),
                name,
                timestamp: Date.now(),
                status,
              },
            ],
          };
        }),
      );
    },
    [currentSessionId],
  );

  // Đặt trạng thái hàng loạt cho toàn bộ danh sách
  const handleSetAllStatus = useCallback(
    (names: string[], status: AttendanceRecord["status"]) => {
      if (!currentSessionId) return;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSessionId) return s;

          const records = [...s.records];
          names.forEach((name) => {
            const idx = records.findIndex(
              (r) => r.name.toLowerCase() === name.toLowerCase(),
            );
            if (idx !== -1) {
              records[idx] = { ...records[idx], status, timestamp: Date.now() };
            } else {
              records.push({
                id: Math.random().toString(36).substring(2),
                name,
                timestamp: Date.now(),
                status,
              });
            }
          });
          return { ...s, records };
        }),
      );
    },
    [currentSessionId],
  );

  const handleSaveAttendance = useCallback(async () => {
    if (!currentSessionId || !userName) {
      setToast({ type: "info", message: "Hãy bắt đầu phiên điểm danh trước." });
      return;
    }

    const existing = sessions.find((s) => s.id === currentSessionId);
    if (!existing) return;

    const now = Date.now();
    const records = [...existing.records];

    // Khi lưu, các bạn chưa có trạng thái sẽ được chốt là vắng không phép.
    CLASS_ROSTER.forEach((name) => {
      const exists = records.some(
        (r) => r.name.toLowerCase() === name.toLowerCase(),
      );
      if (!exists) {
        records.push({
          id: Math.random().toString(36).substring(2),
          name,
          timestamp: now,
          status: "absent-unexcused",
        });
      }
    });

    const updatedSession: Session = {
      ...existing,
      savedAt: now,
      records,
      recordedBy: existing.recordedBy ?? userName,
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === currentSessionId ? updatedSession : s)),
    );

    // Save to database
    {
      try {
        // 1. Save attendance records
        const attendanceResult = await saveAttendanceToDatabase(
          updatedSession,
          userName
        );
        if (!attendanceResult.success) {
          setToast({
            type: "error",
            message: attendanceResult.error || "Lỗi lưu dữ liệu điểm danh",
          });
          return;
        }

        // Lưu remoteId để đồng bộ không bị trùng phiên
        let finalSession = updatedSession;
        if (attendanceResult.data?.id) {
          const remoteId = attendanceResult.data.id;
          finalSession = { ...updatedSession, remoteId };
          const finalWithId = finalSession;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === finalWithId.id ? { ...s, remoteId } : s,
            ),
          );
        }

        // 2. Save attendance history
        const historyResult = await saveAttendanceHistory(finalSession, userName);
        if (!historyResult.success) {
          console.error("Lỗi lưu lịch sử:", historyResult.error);
        }

        // 3. Calculate and save statistics from ALL saved sessions
        //    (gộp phiên của tất cả các cán bộ lớp)
        const allSavedSessions: Session[] = [
          ...sessions.filter((s) => s.savedAt && s.id !== updatedSession.id),
          finalSession,
        ];

        const studentStats = CLASS_ROSTER.map((name) => {
          let present = 0;
          let excused = 0;
          let unexcused = 0;
          allSavedSessions.forEach((session) => {
            const record = session.records.find(
              (r) => r.name.toLowerCase() === name.toLowerCase(),
            );
            if (!record || record.status === "absent-unexcused") unexcused += 1;
            else if (record.status === "present") present += 1;
            else if (record.status === "absent-excused") excused += 1;
            else unexcused += 1;
          });
          const total = allSavedSessions.length;
          return {
            student_name: name,
            total_sessions: total,
            present_count: present,
            absent_excused_count: excused,
            absent_unexcused_count: unexcused,
            attendance_rate:
              total > 0 ? Math.round((present / total) * 100) : 0,
            recorded_by: userName,
          };
        });

        const statsResult = await saveStudentStatistics(studentStats);
        if (!statsResult.success) {
          console.error("Lỗi lưu thống kê:", statsResult.error);
        }

        setToast({
          type: "success",
          message:
            "✅ Đã lưu điểm danh, lịch sử và thống kê lên hệ thống.",
        });
      } catch (error) {
        console.error("Lỗi lưu dữ liệu:", error);
        setToast({
          type: "error",
          message: "Lỗi lưu dữ liệu. Vui lòng thử lại.",
        });
      }
    }
  }, [currentSessionId, userName, sessions]);

  const showToast = useCallback((t: ToastMessage) => {
    setToast(t);
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

  if (!userName) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (!isCanBo) {
    return <AccessDeniedScreen userName={userName} onLogout={handleLogout} />;
  }

  return (
    <>
      <MainScreen
        userName={userName}
        sessions={sessions}
        onLogout={handleLogout}
        onOpenHistory={() => setModal("history")}
        onOpenMyQR={() => setModal("myqr")}
        onOpenZaloReport={() => setModal("zalo-report")}
        onOpenDeleteData={() => setModal("delete-data")}
        onScan={handleScan}
        onToast={showToast}
        currentSession={currentSession}
        onStartSession={handleStartSession}
        onSetStatus={handleSetStatus}
        onSetAllStatus={handleSetAllStatus}
        onSaveAttendance={handleSaveAttendance}
        onOpenStudentStats={setSelectedStudent}
        onSync={() => syncFromDatabase(false)}
        isSyncing={isSyncing}
      />

      {modal === "history" && (
        <HistoryModal
          sessions={sessions}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "myqr" && (
        <MyQRModal userName={userName} onClose={() => setModal(null)} />
      )}

      {modal === "zalo-report" && currentSession && (
        <ZaloReportModal
          session={currentSession}
          onClose={() => setModal(null)}
          onToast={showToast}
        />
      )}

      {modal === "delete-data" && (
        <DeleteDataModal
          userName={userName}
          onClose={() => setModal(null)}
          onToast={showToast}
          onDataDeleted={() => setSessions([])}
        />
      )}

      {selectedStudent && (
        <StudentStatsModal
          studentName={selectedStudent}
          sessions={sessions}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
