import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  History,
  QrCode,
  LogOut,
  Shield,
  CheckCircle2,
  Users,
  Home,
  ClipboardList,
  FileText,
  X,
  Bell,
  Save,
  Send,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { QRScanner } from "./QRScanner";
import { Avatar } from "./MyQRCode";
import { ManualAttendance } from "./ManualAttendance";
import { StudentStatsTable } from "./StudentStatsTable";
import type { Session, AttendanceRecord } from "../utils/helpers";
import { formatTime, formatDateTime } from "../utils/helpers";
import {
  CAN_BO_LOP,
  CLASS_ROSTER,
  findStudentByName,
  findStudentByQrValue,
} from "../data/classRoster";

interface MainScreenProps {
  userName: string;
  sessions: Session[];
  onLogout: () => void;
  onOpenHistory: () => void;
  onOpenMyQR: () => void;
  onScan: (record: AttendanceRecord) => void;
  onToast: (toast: { type: "success" | "error" | "info"; message: string }) => void;
  currentSession: Session | null;
  onStartSession: () => void;
  onSetStatus: (name: string, status: AttendanceRecord["status"] | null) => void;
  onSetAllStatus: (names: string[], status: AttendanceRecord["status"]) => void;
  onSaveAttendance: () => void;
  onOpenStudentStats: (name: string) => void;
  onOpenZaloReport: () => void;
  onOpenDeleteData: () => void;
  onSync: () => void;
  isSyncing?: boolean;
}

function StudentInlineQR({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const student = findStudentByName(name);
  const qrValue = student?.maSV ?? name;
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrValue, {
        width: 160,
        margin: 1,
        color: { dark: "#1C1C1C", light: "#FFFFFF" },
      });
    }
  }, [qrValue]);
  return <canvas ref={canvasRef} className="block rounded-2xl" />;
}

export function MainScreen({
  userName,
  sessions,
  onLogout,
  onOpenHistory,
  onOpenMyQR,
  onScan,
  onToast,
  currentSession,
  onStartSession,
  onSetStatus,
  onSetAllStatus,
  onSaveAttendance,
  onOpenStudentStats,
  onOpenZaloReport,
  onOpenDeleteData,
  onSync,
  isSyncing = false,
}: MainScreenProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [scanFlash, setScanFlash] = useState<null | "success" | "error">(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [tab, setTab] = useState<"scan" | "manual">("scan");
  const isCanBo = CAN_BO_LOP.includes(userName);

  const handleScan = (text: string) => {
    const matched = findStudentByQrValue(text);

    if (!matched) {
      setScanFlash("error");
      setTimeout(() => setScanFlash(null), 800);
      onToast({
        type: "error",
        message: `Không nhận diện được: "${text}"`,
      });
      return;
    }

    if (
      currentSession?.records.some(
        (r) => r.name.toLowerCase() === matched.ten.toLowerCase(),
      )
    ) {
      setScanFlash("error");
      setTimeout(() => setScanFlash(null), 800);
      onToast({
        type: "info",
        message: `${matched.ten} đã điểm danh rồi!`,
      });
      return;
    }

    setScanFlash("success");
    setLastScanned(matched.ten);
    setTimeout(() => setScanFlash(null), 1500);
    setTimeout(() => setLastScanned(null), 2000);

    onScan({
      id: Math.random().toString(36).substring(2),
      name: matched.ten,
      timestamp: Date.now(),
      status: "present",
    });

    onToast({
      type: "success",
      message: `${matched.ten} đã điểm danh thành công!`,
    });
  };

  const presentCount =
    currentSession?.records.filter((r) => r.status === "present").length ?? 0;
  const unexcusedCount =
    currentSession?.records.filter((r) => r.status === "absent-unexcused")
      .length ?? 0;
  const excusedCount =
    currentSession?.records.filter((r) => r.status === "absent-excused")
      .length ?? 0;
  const absentCount = CLASS_ROSTER.length - presentCount;
  const unmarkedCount =
    CLASS_ROSTER.length - presentCount - unexcusedCount - excusedCount;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
      {/* HEADER */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-[2.5px] border-[color:var(--ink)] bg-[color:var(--teal)]">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <p className="font-round text-[11px] font-semibold uppercase tracking-wider text-[color:var(--ink-faint)]">
              Home
            </p>
            <h1 className="font-comic text-xl sm:text-2xl">Điểm Danh QR</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCanBo && (
            <span className="badge-nb hidden sm:inline-flex">
              <Shield className="h-3 w-3" /> Admin
            </span>
          )}
          <button className="btn-glass flex h-11 w-11 items-center justify-center rounded-2xl !p-0">
            <Bell className="h-5 w-5" />
          </button>
          <Avatar name={userName} size={42} />
        </div>
      </header>

      {/* HERO */}
      <div className="mb-6">
        <h2 className="font-comic text-[32px] leading-none sm:text-4xl">
          Xin chào, {userName.split(" ").slice(-1)[0]}
        </h2>
        <p className="mt-2 font-round text-sm font-medium text-[color:var(--ink-faint)]">
          {isCanBo
            ? "Quét QR hoặc tick thủ công để điểm danh cả lớp."
            : "Đưa mã QR của bạn cho cán bộ lớp để điểm danh."}
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          {isCanBo && (
            <div className="flex gap-5 border-b border-[#e6e6ea] px-1">
              <button
                onClick={() => setTab("scan")}
                className="relative pb-3 font-round text-sm font-bold"
                style={{ color: tab === "scan" ? "var(--ink)" : "var(--ink-faint)" }}
              >
                Quét QR
                {tab === "scan" && (
                  <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[color:var(--amber)]" />
                )}
              </button>
              <button
                onClick={() => setTab("manual")}
                className="relative pb-3 font-round text-sm font-bold"
                style={{ color: tab === "manual" ? "var(--ink)" : "var(--ink-faint)" }}
              >
                Thủ công
                {unmarkedCount > 0 && currentSession && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--amber)] px-1 text-[10px] text-[color:var(--ink)]">
                    {unmarkedCount}
                  </span>
                )}
                {tab === "manual" && (
                  <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[color:var(--amber)]" />
                )}
              </button>
            </div>
          )}

          {isCanBo && tab === "manual" && (
            <ManualAttendance
              currentSession={currentSession}
              onSetStatus={onSetStatus}
              onSetAllStatus={onSetAllStatus}
              onToast={onToast}
            />
          )}

          {isCanBo && tab === "scan" && (
            <div
              className={`card-pin p-5 ${scanFlash === "success" ? "scanner-success" : ""} ${scanFlash === "error" ? "animate-shake" : ""}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-comic text-lg">Quét QR Code</p>
                  <p className="font-round text-xs font-medium text-[color:var(--ink-faint)]">
                    Đưa mã vào khung hình
                  </p>
                </div>
                <span className="badge-nb">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--rose)] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--rose)]" />
                  </span>
                  Live
                </span>
              </div>

              {!currentSession ? (
                <div className="py-8 text-center">
                  <p className="font-comic text-lg">Chưa có phiên điểm danh</p>
                  <p className="mt-1 font-round text-sm text-[color:var(--ink-faint)]">
                    Bắt đầu phiên mới để quét QR
                  </p>
                  <button
                    onClick={onStartSession}
                    className="btn-nb mt-5 font-comic"
                  >
                    Bắt đầu phiên
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <QRScanner onScanSuccess={handleScan} isPaused={isPaused} />
                  {lastScanned && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="rounded-[22px] border-[2.5px] border-[color:var(--ink)] bg-white px-5 py-4 shadow-lg animate-pop">
                        <div className="flex items-center gap-3">
                          <Avatar name={lastScanned} size={36} />
                          <div>
                            <p className="font-round text-xs font-bold text-[color:var(--ink-faint)]">
                              Đã điểm danh
                            </p>
                            <p className="font-comic text-base leading-tight">
                              {lastScanned}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentSession && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="btn-glass flex-1 rounded-2xl py-3 font-round text-sm font-bold"
                  >
                    {isPaused ? "Tiếp tục" : "Tạm dừng"}
                  </button>
                  <button
                    onClick={onOpenMyQR}
                    className="btn-nb font-round text-sm"
                  >
                    <QrCode className="h-4 w-4" />
                    QR của tôi
                  </button>
                </div>
              )}
            </div>
          )}

          {!isCanBo && (
            <div className="card-pin p-5">
              <p className="font-comic text-lg">Mã QR của bạn</p>
              <p className="mb-4 mt-1 font-round text-sm text-[color:var(--ink-faint)]">
                Đưa mã này cho cán bộ lớp để điểm danh.
              </p>
              <div className="flex justify-center">
                <button onClick={onOpenMyQR} className="polaroid">
                  <StudentInlineQR name={userName} />
                  <p className="mt-2 text-center font-comic">{userName}</p>
                  {findStudentByName(userName) && (
                    <p className="text-center font-round text-xs font-bold text-[color:var(--ink-faint)]">
                      {findStudentByName(userName)?.maSV}
                    </p>
                  )}
                </button>
              </div>
              <button
                onClick={onOpenMyQR}
                className="btn-nb mt-4 w-full font-comic"
              >
                Phóng to QR
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="card-pin p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[color:var(--ink-faint)]">
                <Users className="h-4 w-4" />
                <p className="font-round text-xs font-bold uppercase">Sĩ số</p>
              </div>
              <p className="font-comic text-3xl">{CLASS_ROSTER.length}</p>
              <p className="mt-1 font-round text-xs text-[color:var(--ink-faint)]">
                học sinh
              </p>
            </div>
            <div className="card-pin card-pin-alt p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[color:var(--ink-faint)]">
                <CheckCircle2 className="h-4 w-4" />
                <p className="font-round text-xs font-bold uppercase">
                  {currentSession ? "Có mặt" : "Trạng thái"}
                </p>
              </div>
              {currentSession ? (
                <>
                  <p className="font-comic text-3xl">
                    {presentCount}
                    <span className="text-lg text-[color:var(--ink-faint)]">
                      /{CLASS_ROSTER.length}
                    </span>
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eceef4]">
                    <div
                      className="h-full rounded-full bg-[color:var(--teal)]"
                      style={{
                        width: `${
                          CLASS_ROSTER.length > 0
                            ? (presentCount / CLASS_ROSTER.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="font-comic text-2xl">Chờ...</p>
                  <p className="mt-1 font-round text-xs text-[color:var(--ink-faint)]">
                    {isCanBo ? "Chưa có phiên" : "Chưa điểm danh"}
                  </p>
                </>
              )}
            </div>
          </div>

          {isCanBo && currentSession && (
            <div className="grid grid-cols-2 gap-3">
              <div className="card-nb-pink rounded-[24px] p-4">
                <div className="mb-1 flex items-center gap-1.5">
                  <X className="h-4 w-4" strokeWidth={3} />
                  <p className="font-round text-xs font-bold uppercase">
                    Vắng không phép
                  </p>
                </div>
                <p className="font-comic text-3xl">{unexcusedCount}</p>
              </div>
              <div className="card-nb-yellow rounded-[24px] p-4">
                <div className="mb-1 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <p className="font-round text-xs font-bold uppercase">
                    Vắng có phép
                  </p>
                </div>
                <p className="font-comic text-3xl">{excusedCount}</p>
              </div>
            </div>
          )}

          {isCanBo && (
            <button
              onClick={currentSession ? onSaveAttendance : onStartSession}
              className="btn-nb w-full font-comic"
            >
              {currentSession ? "Lưu điểm danh" : "Bắt đầu phiên ngay"}
            </button>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
        <div className="card-pin p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-comic text-lg">Hoạt động gần đây</p>
              <p className="font-round text-xs font-medium text-[color:var(--ink-faint)]">
                {currentSession
                  ? `Phiên ${formatTime(currentSession.createdAt)}`
                  : "Chưa có phiên"}
              </p>
            </div>
            {isCanBo && (
              <div className="flex gap-2">
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="btn-nb rounded-2xl px-3 py-2 font-round text-xs font-bold disabled:opacity-50"
                  title="Tải phiên điểm danh mới nhất từ các cán bộ khác"
                >
                  <RefreshCw
                    className={`mr-1 inline h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Đang sync..." : "Đồng bộ"}
                </button>
                <button
                  onClick={onSaveAttendance}
                  className="btn-nb rounded-2xl px-3 py-2 font-round text-xs font-bold"
                  title="Lưu và chốt điểm danh phiên hiện tại"
                >
                  <Save className="mr-1 inline h-4 w-4" />
                  Lưu
                </button>
                <button
                  onClick={onOpenZaloReport}
                  className="btn-nb rounded-2xl px-3 py-2 font-round text-xs font-bold"
                  title="Xuất báo cáo gửi qua Zalo"
                  disabled={!currentSession || currentSession.records.length === 0}
                >
                  <Send className="mr-1 inline h-4 w-4" />
                  Zalo
                </button>
                <button
                  onClick={onOpenHistory}
                  className="btn-glass rounded-2xl px-3 py-2 font-round text-xs font-bold"
                >
                  <History className="mr-1 inline h-4 w-4" />
                  Lịch sử
                  {sessions.length > 0 && (
                    <span className="ml-1">{sessions.length}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {!currentSession || currentSession.records.length === 0 ? (
            <div className="py-14 text-center">
              <p className="font-comic text-lg">Chưa có hoạt động</p>
              <p className="mt-1 font-round text-sm text-[color:var(--ink-faint)]">
                {isCanBo
                  ? "Quét QR hoặc tick thủ công để bắt đầu."
                  : "Đợi cán bộ lớp bắt đầu phiên điểm danh."}
              </p>
            </div>
          ) : (
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {[...currentSession.records]
                .reverse()
                .slice(0, 20)
                .map((record, idx) => {
                  const stripe =
                    record.status === "present"
                      ? "stripe-teal"
                      : record.status === "absent-excused"
                        ? "stripe-amber"
                        : "stripe-rose";
                  return (
                    <div
                      key={record.id}
                      className={`card-pin ${idx % 2 === 0 ? "" : "card-pin-alt"} ${stripe} flex items-center gap-3 p-3 animate-pop`}
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <Avatar name={record.name} size={42} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-round text-sm font-bold text-[color:var(--ink)]">
                          {record.name}
                        </p>
                        <p className="font-round text-xs text-[color:var(--ink-faint)]">
                          {formatDateTime(record.timestamp)}
                        </p>
                      </div>
                      <span className="badge-nb">
                        {record.status === "present"
                          ? "Có mặt"
                          : record.status === "absent-excused"
                            ? "Vắng CP"
                            : "Vắng KP"}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}

          {currentSession && presentCount > 0 && absentCount > 0 && (
            <div className="bubble mt-5">
              <p className="mb-2 font-round text-xs font-bold uppercase text-[color:var(--ink-faint)]">
                Còn thiếu ({absentCount})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CLASS_ROSTER.filter(
                  (n) =>
                    !currentSession.records.some(
                      (r) => r.name.toLowerCase() === n.toLowerCase(),
                    ),
                )
                  .slice(0, 8)
                  .map((name) => (
                    <span
                      key={name}
                      className="rounded-full border-2 border-[color:var(--ink)] bg-white px-2.5 py-0.5 font-round text-xs font-bold"
                    >
                      {name}
                    </span>
                  ))}
                {absentCount > 8 && (
                  <span className="font-round text-xs font-bold text-[color:var(--ink-faint)]">
                    +{absentCount - 8} bạn khác
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {isCanBo && (
          <StudentStatsTable
            sessions={sessions}
            onOpenStudentStats={onOpenStudentStats}
          />
        )}
        </div>
      </div>

      <nav className="bottom-nav">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="nav-item nav-item--active"
          title="Trang chủ"
        >
          <Home className="h-5 w-5" />
        </button>
        {isCanBo && (
          <button onClick={onOpenHistory} className="nav-item" title="Lịch sử">
            <History className="h-5 w-5" />
          </button>
        )}
        {isCanBo && (
          <button
            onClick={() => setTab(tab === "manual" ? "scan" : "manual")}
            className="nav-item"
            title="Thủ công"
          >
            <ClipboardList className="h-5 w-5" />
          </button>
        )}
        <button onClick={onOpenMyQR} className="nav-item-primary" title="QR của tôi">
          <QrCode className="h-5 w-5" />
        </button>
        {isCanBo && (
          <button
            onClick={onOpenDeleteData}
            className="nav-item"
            title="Xóa dữ liệu test"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
        <button onClick={onLogout} className="nav-item" title="Thoát">
          <LogOut className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
}
