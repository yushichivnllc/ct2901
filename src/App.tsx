import { useState, useEffect, useCallback } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { MainScreen } from "./components/MainScreen";
import { HistoryModal } from "./components/HistoryModal";
import { MyQRModal } from "./components/MyQRModal";
import { StudentStatsModal } from "./components/StudentStatsModal";
import { ZaloReportModal } from "./components/ZaloReportModal";
import { Toast, type ToastMessage } from "./components/Toast";
import type { Session, AttendanceRecord } from "./utils/helpers";
import { CLASS_ROSTER } from "./data/classRoster";

const STORAGE_KEY = "dd-comic-user";
const SESSIONS_KEY = "dd-comic-sessions";

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "history" | "myqr" | "zalo-report">(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) setUserName(savedUser);

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
    localStorage.setItem(STORAGE_KEY, name);
  };

  const handleLogout = () => {
    setUserName(null);
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

  const handleSaveAttendance = useCallback(() => {
    if (!currentSessionId) {
      setToast({ type: "info", message: "Hãy bắt đầu phiên điểm danh trước." });
      return;
    }

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

        return {
          ...s,
          savedAt: now,
          records,
        };
      }),
    );

    setToast({ type: "success", message: "Đã lưu điểm danh phiên hiện tại." });
  }, [currentSessionId]);

  const showToast = useCallback((t: ToastMessage) => {
    setToast(t);
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;

  if (!userName) {
    return <AuthScreen onLogin={handleLogin} />;
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
