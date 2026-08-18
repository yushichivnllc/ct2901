import { X, Copy, Send } from "lucide-react";
import type { Session } from "../utils/helpers";
import { generateZaloReport } from "../utils/helpers";

const TEACHER_PHONE = "0902202066";

interface ZaloReportModalProps {
  session: Session;
  onClose: () => void;
  onToast: (toast: { type: "success" | "error" | "info"; message: string }) => void;
}

export function ZaloReportModal({
  session,
  onClose,
  onToast,
}: ZaloReportModalProps) {
  const reportMessage = generateZaloReport(session);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reportMessage).then(() => {
      onToast({
        type: "success",
        message: "✅ Đã sao chép báo cáo vào clipboard!",
      });
    }).catch(() => {
      onToast({
        type: "error",
        message: "❌ Không thể sao chép. Vui lòng thử lại.",
      });
    });
  };

  const handleSendZalo = () => {
    const encodedMessage = encodeURIComponent(reportMessage);
    const zaloDeepLink = `zalo://qr/share?url=${encodedMessage}`;
    
    // Try to open Zalo, fallback to copying if Zalo is not installed
    window.location.href = zaloDeepLink;
    
    // Show a helpful message
    setTimeout(() => {
      onToast({
        type: "info",
        message: "📱 Nếu Zalo không mở được, vui lòng sao chép thủ công.",
      });
    }, 500);
  };

  const handleSendToTeacher = () => {
    const encodedMessage = encodeURIComponent(reportMessage);
    // Try multiple Zalo deeplink formats
    const zaloDeepLinks = [
      `zalo://user/${TEACHER_PHONE}?message=${encodedMessage}`,
      `zalo://${TEACHER_PHONE}`,
    ];
    
    // Try the first link
    window.location.href = zaloDeepLinks[0];
    
    // Show a helpful message
    setTimeout(() => {
      onToast({
        type: "success",
        message: `📱 Đang mở Zalo với giáo viên (${TEACHER_PHONE})`,
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="card-pin w-full max-w-md overflow-hidden rounded-3xl shadow-2xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[color:var(--ink)] bg-gradient-to-r from-[color:var(--teal)] to-[color:var(--violet)] p-5">
          <div>
            <h2 className="font-comic text-xl text-white">Báo Cáo Điểm Danh</h2>
            <p className="font-round text-xs font-medium text-white/80">
              Gửi qua Zalo
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 p-2 transition hover:bg-white/30"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-5">
          <div className="rounded-2xl bg-[#f5f5f5] p-4">
            <p className="whitespace-pre-wrap font-round text-sm leading-relaxed text-[color:var(--ink)]">
              {reportMessage}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSendToTeacher}
              className="btn-nb w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-comic text-base font-bold"
              title={`Gửi cho giáo viên ${TEACHER_PHONE}`}
            >
              <Send className="h-5 w-5" />
              📱 Gửi cho GV (Zalo)
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleCopyToClipboard}
                className="btn-glass flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-round text-sm font-bold"
              >
                <Copy className="h-4 w-4" />
                Sao chép
              </button>
              <button
                onClick={handleSendZalo}
                className="btn-glass flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-round text-sm font-bold"
              >
                <Send className="h-4 w-4" />
                Gửi Zalo
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-2xl bg-amber/10 p-3">
            <p className="font-round text-xs text-[color:var(--ink-faint)]">
              💡 Bạn có thể sao chép và dán vào Zalo hoặc bất kỳ ứng dụng nào khác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
