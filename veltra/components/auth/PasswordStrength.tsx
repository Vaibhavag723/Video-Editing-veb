"use client";

import { cn } from "@/lib/cn";

/** Password strength scoring: length / case mix / digits / symbols. */
export function strengthOf(pw: string): { score: number; label: string; segments: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 6) score = Math.min(score, 1);
  const labels = ["Very weak", "Weak", "Okay", "Good", "Strong"];
  return { score, label: labels[score], segments: score };
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = strengthOf(password);
  const colors = ["bg-white/10", "bg-rose-500", "bg-amber-400", "bg-lime-400", "bg-lime-400"];
  const text = ["text-slate-500", "text-rose-400", "text-amber-300", "text-lime-300", "text-lime-300"];

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              password.length === 0 ? "bg-white/[0.07]" : i < score ? colors[score] : "bg-white/[0.07]"
            )}
          />
        ))}
        <span className={cn("ml-2 w-20 text-right text-[11px] font-semibold", password.length === 0 ? "text-slate-600" : text[score])}>
          {password.length === 0 ? "—" : label}
        </span>
      </div>
    </div>
  );
}

export function PasswordChecks({
  password,
  confirm,
}: {
  password: string;
  confirm: string;
}) {
  const rules = [
    { ok: password.length >= 8, text: "At least 8 characters" },
    { ok: /[A-Z]/.test(password) && /[a-z]/.test(password), text: "Upper & lowercase letters" },
    { ok: /\d/.test(password), text: "At least one number" },
    { ok: /[^A-Za-z0-9]/.test(password), text: "At least one symbol" },
    { ok: confirm.length > 0 && password === confirm, text: "Passwords match" },
  ];
  const passed = rules.filter((r) => r.ok).length;

  return (
    <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Password helps</span>
        <span className="nums text-[11px] font-bold text-slate-400">{passed}/{rules.length}</span>
      </div>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {rules.map((r) => (
          <li key={r.text} className="flex items-center gap-2 text-[12px]">
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black transition-colors",
                r.ok ? "bg-lime-400 text-lime-950" : "bg-white/[0.07] text-transparent"
              )}
            >
              ✓
            </span>
            <span className={r.ok ? "text-slate-300" : "text-slate-500"}>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}