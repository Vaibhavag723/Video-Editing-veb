"use client";

import type { ReactNode } from "react";
import { AuthBrandPanel } from "./AuthBrandPanel";
import { LogoMark } from "@/components/brand/Logo";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel />
      {/* right · form */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
        </div>
        <div className="relative mb-8 lg:hidden">
          <LogoMark size={44} />
        </div>
        <div className="relative w-full max-w-[420px]">{children}</div>
        <p className="relative mt-8 text-center text-[12px] text-slate-600">
          © 2026 Veltra Studios, Inc. ·{" "}
          <a className="text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline" href="#">
            Terms
          </a>{" "}
          ·{" "}
          <a className="text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline" href="#">
            Privacy
          </a>
        </p>
      </div>
    </div>
  );
}