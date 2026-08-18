import { useState, useEffect } from "react";
import { Search, Sparkles, QrCode } from "lucide-react";
import { STUDENTS, findStudentByQrValue } from "../data/classRoster";

interface AuthScreenProps {
  onLogin: (name: string) => void;
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (name.trim().length > 1) {
      const lower = name.toLowerCase();
      const matches = STUDENTS.filter(
        (student) =>
          student.ten.toLowerCase().includes(lower) ||
          student.maSV.toLowerCase().includes(lower),
      )
        .slice(0, 4)
        .map((student) => student.ten);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Bạn chưa nhập tên!");
      triggerShake();
      return;
    }

    const matched = findStudentByQrValue(trimmed);

    if (!matched) {
      setError("Tên hoặc mã SV không khớp danh sách lớp");
      triggerShake();
      return;
    }

    onLogin(matched.ten);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div
        className={`relative z-10 w-full max-w-md ${shake ? "animate-shake" : ""}`}
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[2.5px] border-[color:var(--ink)] bg-[color:var(--teal)]">
            <QrCode className="h-6 w-6 text-[color:var(--ink)]" />
          </div>
          <div>
            <p className="font-round text-xs font-semibold text-[color:var(--ink-faint)]">
              Attendance
            </p>
            <h1 className="font-comic text-2xl">Điểm Danh QR</h1>
          </div>
        </div>

        <div className="card-pin p-6 sm:p-7">
          <p className="font-comic text-[28px] leading-none">Xin chào 👋</p>
          <p className="mt-2 font-round text-sm font-medium text-[color:var(--ink-faint)]">
            Nhập chính xác họ tên hoặc mã SV để bắt đầu phiên điểm danh.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-faint)]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Tìm tên hoặc mã SV..."
                  className="input-nb pl-11 font-round"
                  autoFocus
                />
              </div>

              {suggestions.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-[22px] border-[2.5px] border-[color:var(--ink)] bg-white animate-pop">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setName(s);
                        setSuggestions([]);
                      }}
                      className="block w-full border-b border-[#eee] px-4 py-3 text-left font-round text-sm font-semibold text-[color:var(--ink)] last:border-b-0 hover:bg-[#f7f8fb]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border-[2.5px] border-[color:var(--ink)] bg-[#fff6f8] px-4 py-3 font-round text-sm font-bold text-[#c23b57] animate-pop">
                {error}
              </div>
            )}

            <button type="submit" className="btn-nb w-full font-comic text-base">
              <Sparkles className="h-4 w-4" />
              Bắt đầu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
