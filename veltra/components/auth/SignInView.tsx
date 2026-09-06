"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, Lock, Mail } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { GoogleIcon } from "./PasswordStrength";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SignInView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 650);
  };

  return (
    <AuthLayout>
      <div className="anim-fade-up">
        <div className="mb-8 text-center lg:text-left">
          <p className="label-overline text-lime-300">Welcome back</p>
          <h2 className="display mt-2 text-[28px] font-bold tracking-tight text-white">Sign in to Veltra</h2>
          <p className="mt-2 text-[13.5px] text-slate-500">
            Pick up right where you left off — your timeline is waiting.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            placeholder="you@studio.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setForgot((f) => !f)}
                className="text-[12.5px] font-semibold text-violet-300 underline-offset-2 transition-colors hover:text-violet-200 hover:underline"
              >
                Forgot password?
              </button>
              <label className="flex cursor-pointer select-none items-center gap-2 text-[12.5px] text-slate-500">
                <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-lime-400" />
                Remember me
              </label>
            </div>
            {forgot && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-3 text-[12.5px] leading-relaxed text-cyan-200">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <span>
                  We&apos;ll email a secure reset link to your inbox. In the meantime, the demo
                  accepts any credentials.
                </span>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-lime-950/30 border-t-lime-950" />
                Signing you in…
              </>
            ) : (
              <>
                Sign in <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">or continue with</span>
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => {
            setLoading(true);
            setTimeout(() => router.push("/dashboard"), 600);
          }}
          disabled={loading}
        >
          <GoogleIcon className="h-[18px] w-[18px]" />
          Continue with Google
        </Button>

        <p className="mt-8 text-center text-[13.5px] text-slate-500">
          New to Veltra?{" "}
          <Link href="/signup" className="font-semibold text-lime-300 underline-offset-2 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}