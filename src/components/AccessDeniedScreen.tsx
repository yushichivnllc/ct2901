import { Lock, LogOut } from "lucide-react";

interface AccessDeniedScreenProps {
  userName: string;
  onLogout: () => void;
}

export function AccessDeniedScreen({
  userName,
  onLogout,
}: AccessDeniedScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[color:var(--violet)] to-[color:var(--rose)] p-4">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="rounded-full bg-[color:var(--rose)]/10 p-4">
          <Lock className="h-12 w-12 text-[color:var(--rose)]" />
        </div>

        <div>
          <h1 className="font-comic text-3xl text-[color:var(--ink)]">
            Truy cập bị từ chối
          </h1>
          <p className="mt-2 font-round text-base text-[color:var(--ink-faint)]">
            Rất tiếc, {userName}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f5f5f5] p-4">
          <p className="font-round text-sm text-[color:var(--ink)]">
            📋 Chỉ <strong>cán bộ lớp</strong> mới có quyền truy cập vào hệ thống
            điểm danh này.
          </p>
        </div>

        <p className="font-round text-xs text-[color:var(--ink-faint)]">
          Vui lòng liên hệ với cán bộ lớp nếu bạn có yêu cầu.
        </p>

        <button
          onClick={onLogout}
          className="btn-nb mt-4 flex items-center gap-2 font-comic"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
