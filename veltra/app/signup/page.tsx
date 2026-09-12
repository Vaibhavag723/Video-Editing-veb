import type { Metadata } from "next";
import { SignUpView } from "@/components/auth/SignUpView";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join Veltra and start creating videos that keep moving.",
};

export default function SignUpPage() {
  return <SignUpView />;
}