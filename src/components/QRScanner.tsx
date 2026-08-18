import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Camera, CameraOff } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (text: string) => void;
  isPaused: boolean;
}

export function QRScanner({ onScanSuccess, isPaused }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const controlsRef = useRef<IScannerControls | null>(null);
  const cooldownRef = useRef(false);

  useEffect(() => {
    if (isPaused) {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
      return;
    }

    let cancelled = false;
    const codeReader = new BrowserMultiFormatReader();

    async function start() {
      try {
        setError(null);
        if (!videoRef.current) return;

        // Camera chỉ khả dụng trong secure context (HTTPS hoặc localhost)
        if (!navigator.mediaDevices?.getUserMedia) {
          setError(
            window.isSecureContext
              ? "Thiết bị/trình duyệt không hỗ trợ camera"
              : "Camera cần HTTPS hoặc localhost",
          );
          return;
        }

        const controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result && !cooldownRef.current && !cancelled) {
              cooldownRef.current = true;
              onScanSuccess(result.getText());
              setTimeout(() => {
                cooldownRef.current = false;
              }, 2000);
            }
          },
        );

        if (!cancelled) {
          controlsRef.current = controls;
          setIsReady(true);
        } else {
          controls.stop();
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error(err);
          setError(
            err?.name === "NotAllowedError"
              ? "Bạn chưa cấp quyền camera"
              : "Không tìm thấy camera",
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, [isPaused, onScanSuccess]);

  return (
    <div className="relative">
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border-[2.5px] border-[color:var(--ink)] bg-[#111]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />

        <span className="corner-bracket corner-tl" />
        <span className="corner-bracket corner-tr" />
        <span className="corner-bracket corner-bl" />
        <span className="corner-bracket corner-br" />

        {!isPaused && !error && <div className="scan-line" />}

        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border-[2px] border-[color:var(--ink)] bg-white px-3 py-1 text-[11px] font-bold">
          {error ? (
            <>
              <CameraOff className="h-3.5 w-3.5" />
              OFFLINE
            </>
          ) : isReady ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--rose)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--rose)]" />
              </span>
              LIVE
            </>
          ) : (
            <>
              <Camera className="h-3.5 w-3.5 animate-pulse" />
              LOADING
            </>
          )}
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-6 text-center">
            <div className="card-nb-yellow max-w-xs px-6 py-5">
              <p className="font-round text-base font-bold text-[color:var(--ink)]">
                {error}
              </p>
              <p className="mt-1 font-round text-sm font-medium text-[color:var(--ink-faint)]">
                {error === "Camera cần HTTPS hoặc localhost"
                  ? "Mở app qua https://... hoặc http://localhost:5173. Hoặc dùng tab Thủ công để điểm danh."
                  : "Vui lòng cho phép camera để quét mã QR"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
