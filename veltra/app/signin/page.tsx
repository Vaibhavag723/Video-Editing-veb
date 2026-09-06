import type { Metadata } from "next";
import { SignInView } from "@/components/auth/SignInView";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Veltra — your video studio awaits.",
};

export default function SignInPage() {
  return <SignInView />;
}