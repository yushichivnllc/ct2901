import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, User } from "lucide-react";
import { getAvatarColor, getInitials } from "../utils/helpers";
import { findStudentByName } from "../data/classRoster";

interface MyQRCodeProps {
  name: string;
}

export function MyQRCode({ name }: MyQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const color = getAvatarColor(name);
  const student = findStudentByName(name);
  const qrValue = student?.maSV ?? name;

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, qrValue, {
      width: 240,
      margin: 1,
      color: {
        dark: "#1C1C1C",
        light: "#FFFFFF",
      },
    });

    QRCode.toDataURL(qrValue, { width: 512, margin: 2 }).then(setDataUrl);
  }, [qrValue]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-${name.replace(/\s+/g, "-")}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="polaroid">
        <canvas ref={canvasRef} className="block rounded-2xl" />
        <div className="mt-3 flex flex-col items-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border-[2.5px] border-[color:var(--ink)] font-comic text-lg text-white"
            style={{ background: color }}
          >
            {getInitials(name)}
          </div>
          <p className="mt-1.5 font-comic text-base">{name}</p>
          {student && (
            <p className="font-round text-xs font-bold text-[color:var(--ink-faint)]">
              {student.maSV}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="btn-nb mt-6 flex items-center gap-2 font-round"
      >
        <Download className="h-4 w-4" />
        Tải QR Code
      </button>

      <p className="mt-4 text-center font-round text-sm font-medium text-[color:var(--ink-faint)]">
        Đưa mã này cho cán bộ lớp
        <br />
        để điểm danh siêu tốc.
      </p>
    </div>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const color = getAvatarColor(name);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-[2.5px] border-[color:var(--ink)] font-comic"
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: size * 0.34,
        color: "#fff",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

export function EmptyState({
  icon: Icon = User,
  title,
  description,
}: {
  icon?: any;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[2.5px] border-[color:var(--ink)] bg-[color:var(--amber)]">
        <Icon className="h-7 w-7 text-[color:var(--ink)]" />
      </div>
      <h3 className="mt-4 font-comic text-xl">{title}</h3>
      <p className="mt-1 font-round text-sm font-medium text-[color:var(--ink-faint)]">
        {description}
      </p>
    </div>
  );
}
