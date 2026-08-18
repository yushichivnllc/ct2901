import { X } from "lucide-react";
import { MyQRCode } from "./MyQRCode";

interface MyQRModalProps {
  userName: string;
  onClose: () => void;
}

export function MyQRModal({ userName, onClose }: MyQRModalProps) {
  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card-pin relative w-full max-w-sm overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="font-comic text-xl">QR của tôi</p>
            <p className="font-round text-xs text-[color:var(--ink-faint)]">
              Dùng để điểm danh
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-glass flex h-10 w-10 items-center justify-center rounded-2xl !p-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 pt-0">
          <MyQRCode name={userName} />
        </div>
      </div>
    </div>
  );
}
