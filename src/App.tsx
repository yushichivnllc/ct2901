import { useState, useEffect, useCallback } from "react";
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
} from "./utils/database";

console.log("🚀 App.tsx imported, CAN_BO_LOP:", CAN_BO_LOP);

const STORAGE_KEY = "dd-comic-user";
const SESSIONS_KEY = "dd-comic-sessions";

export default function App() {
  console.log("🎬 App component rendering");
  const [userName, setUserName] = useState<string | null>(null);
  const [isCanBo, setIsCanBo] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "history" | "myqr" | "zalo-report" | "delete-data">(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

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
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setToast({ type: "success", message: "🚀 Phiên điểm danh đã bắt đầu!" });
  }, []);

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

    let savedSession: Session | null = null;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s;

        const now = Date.now();
        const records = [...s.records];

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

        const updatedSession = {
          ...s,
          savedAt: now,
          records,
        };
        savedSession = updatedSession;
        return updatedSession;
      }),
    );

    // Save to database
    if (savedSession) {
      try {
        // 1. Save attendance records
        const attendanceResult = await saveAttendanceToDatabase(
          savedSession,
          userName
        );
        if (!attendanceResult.success) {
          setToast({
            type: "error",
            message: attendanceResult.error || "Lỗi lưu dữ liệu điểm danh",
          });
          return;
        }

        // 2. Save attendance history
        const historyResult = await saveAttendanceHistory(savedSession, userName);
        if (!historyResult.success) {
          console.error("Lỗi lưu lịch sử:", historyResult.error);
        }

        // 3. Calculate and save student statistics
        const studentStats = CLASS_ROSTER.map((name) => {
          const record = savedSession!.records.find(
            (r) => r.name.toLowerCase() === name.toLowerCase()
          );
          return {
            student_name: name,
            total_sessions: 1,
            present_count: record?.status === "present" ? 1 : 0,
            absent_excused_count:
              record?.status === "absent-excused" ? 1 : 0,
            absent_unexcused_count:
              record?.status === "absent-unexcused" ? 1 : 0,
            attendance_rate:
              record?.status === "present" ? 100 : record ? 0 : 0,
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
    } else {
      setToast({
        type: "success",
        message: "Đã lưu điểm danh phiên hiện tại.",
      });
    }
  }, [currentSessionId, userName]);

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
