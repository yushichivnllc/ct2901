// Helper types and utilities
export interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: number;
  status: "present" | "absent-excused" | "absent-unexcused";
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  savedAt?: number;
  records: AttendanceRecord[];
  /** Tên cán bộ lớp đã thực hiện phiên điểm danh */
  recordedBy?: string;
  /** ID bản ghi trên Supabase (dùng để dedupe khi đồng bộ) */
  remoteId?: string;
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

export const COLORS = {
  teal: "#3ECAD6",
  amber: "#F0A94A",
  violet: "#7B6CFF",
  rose: "#FF6B8A",
  ink: "#1C1C1C",
};

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Generate Zalo report message
export function generateZaloReport(session: Session): string {
  const unexcusedStudents = session.records.filter(
    (r) => r.status === "absent-unexcused"
  );
  const excusedStudents = session.records.filter(
    (r) => r.status === "absent-excused"
  );

  const reportDate = formatDate(session.createdAt);
  let message = `Thầy ơi, Hôm nay lớp CT2901 ${reportDate} vắng những bạn sau ạ:\n`;

  if (unexcusedStudents.length > 0) {
    message += unexcusedStudents.map((r) => `- ${r.name}`).join("\n");
  } else {
    message += "- (Không có bạn nào vắng không phép)";
  }

  message += "\n\nNhững bạn sau có phép ạ:\n";
  if (excusedStudents.length > 0) {
    message += excusedStudents.map((r) => `- ${r.name}`).join("\n");
  } else {
    message += "- (Không có bạn nào vắng có phép)";
  }

  if (session.recordedBy) {
    message += `\n\nNgười thực hiện điểm danh: ${session.recordedBy}`;
  }

  return message;
}

// Get avatar color based on name
export function getAvatarColor(name: string): string {
  const colors = ["#3ECAD6", "#F0A94A", "#7B6CFF", "#FF6B8A", "#22B8C6", "#E89628", "#5B8DEF", "#34D399"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
export function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
