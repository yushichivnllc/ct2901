import { useEffect } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export interface ToastMessage {
  id?: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const styles = {
    success: { Icon: CheckCircle2, bg: "var(--teal)" },
    error: { Icon: XCircle, bg: "var(--rose)" },
    info: { Icon: Info, bg: "var(--amber)" },
  }[toast.type];

  const Icon = styles.Icon;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[100] -translate-x-1/2 animate-slide-in">
      <div
        className="pointer-events-auto flex items-center gap-3 rounded-full border-[2.5px] border-[color:var(--ink)] px-5 py-3"
        style={{ background: styles.bg, maxWidth: "90vw" }}
      >
        <Icon className="h-5 w-5 shrink-0 text-[color:var(--ink)]" />
        <p className="font-round text-sm font-bold text-[color:var(--ink)]">
          {toast.message}
        </p>
      </div>
    </div>
  );
}
