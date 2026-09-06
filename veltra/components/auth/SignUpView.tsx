"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, UserRound } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { GoogleIcon, PasswordChecks, PasswordStrength, strengthOf } from "./PasswordStrength";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SignUpView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (strengthOf(password).score < 3) e.password = "Use a stronger password (see checklist below).";
    if (confirm !== password) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 700);
  };

  const google = () => {
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 600);
  };

  return (
    <AuthLayout>
      <div className="anim-fade-up">
        <div className="mb-7 text-center lg:text-left">
          <p className="label-overline text-lime-300">Start free</p>
          <h2 className="display mt-2 text-[28px] font-bold tracking-tight text-white">Create your account</h2>
          <p className="mt-2 text-[13.5px] text-slate-500">
            Free plan forever. No credit card required — 4K exports, AI captions included.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="space-y-3.5">
          <Input
            label="Full name"
            placeholder="Avery Stone"
            icon={UserRound}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@studio.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <PasswordStrength password={password} />
          </div>
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            icon={Lock}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
          />
          <PasswordChecks password={password} confirm={confirm} />

          <Button type="submit" size="lg" className="w-full !mt-5" disabled={loading}>
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-lime-950/30 border-t-lime-950" />
                Creating your studio…
              </>
            ) : (
              <>
                Create account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">or</span>
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <Button variant="secondary" size="lg" className="w-full" onClick={google} disabled={loading}>
          <GoogleIcon className="h-[18px] w-[18px]" />
          Sign up with Google
        </Button>

        <p className="mt-7 text-center text-[13px] text-slate-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-lime-300 underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}