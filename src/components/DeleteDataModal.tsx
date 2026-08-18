import { useState } from "react";
import { AlertCircle, X, Trash2 } from "lucide-react";
import { deleteAllAttendanceData, deleteAttendanceDataByUser } from "../utils/database";

interface DeleteDataModalProps {
  userName: string;
  onClose: () => void;
  onToast: (toast: { type: "success" | "error" | "info"; message: string }) => void;
  onDataDeleted?: () => void;
}

export function DeleteDataModal({
  userName,
  onClose,
  onToast,
  onDataDeleted,
}: DeleteDataModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"user" | "all">("user");

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      let result;

      if (deleteMode === "all") {
        result = await deleteAllAttendanceData();
      } else {
        result = await deleteAttendanceDataByUser(userName);
      }

      if (result.success) {
        onToast({
          type: "success",
          message: `🗑️ Đã xóa toàn bộ dữ liệu ${deleteMode === "all" ? "hệ thống" : "của bạn"}!`,
        });
        onDataDeleted?.();
        setTimeout(() => onClose(), 500);
      } else {
        onToast({
          type: "error",
          message: result.error || "Lỗi xóa dữ liệu",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="card-pin w-full max-w-md overflow-hidden rounded-3xl shadow-2xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[color:var(--rose)] bg-gradient-to-r from-[color:var(--rose)] to-[color:var(--amber)] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-comic text-xl text-white">Xóa dữ liệu test</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 p-2 transition hover:bg-white/30"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-5">
          <div className="rounded-2xl bg-rose/10 p-4">
            <p className="font-round text-sm text-[color:var(--ink)]">
              ⚠️ <strong>Cảnh báo:</strong> Hành động này sẽ <strong>xóa vĩnh viễn</strong>{" "}
              tất cả dữ liệu điểm danh. Không thể hoàn tác!
            </p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <p className="font-comic text-sm text-[color:var(--ink)]">
              Chọn phạm vi xóa:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setDeleteMode("user")}
                className={`w-full rounded-2xl border-2 p-3 text-left transition ${
                  deleteMode === "user"
                    ? "border-[color:var(--rose)] bg-rose/10"
                    : "border-gray-300 bg-white"
                }`}
              >
                <p className="font-round font-bold text-[color:var(--ink)]">
                  📋 Dữ liệu của tôi
                </p>
                <p className="text-xs text-[color:var(--ink-faint)]">
                  Chỉ xóa điểm danh do {userName} ghi lại
                </p>
              </button>

              <button
                onClick={() => setDeleteMode("all")}
                className={`w-full rounded-2xl border-2 p-3 text-left transition ${
                  deleteMode === "all"
                    ? "border-[color:var(--rose)] bg-rose/10"
                    : "border-gray-300 bg-white"
                }`}
              >
                <p className="font-round font-bold text-[color:var(--ink)]">
                  🗑️ Tất cả dữ liệu
                </p>
                <p className="text-xs text-[color:var(--ink-faint)]">
                  Xóa tất cả dữ liệu điểm danh trong hệ thống
                </p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="btn-glass flex-1 rounded-2xl py-3 font-round text-sm font-bold"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-nb flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--rose)] py-3 font-comic text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>

          {/* Info */}
          <div className="rounded-2xl bg-amber/10 p-3">
            <p className="font-round text-xs text-[color:var(--ink-faint)]">
              💡 Hữu ích khi test chức năng hoặc muốn xóa dữ liệu test thử.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
