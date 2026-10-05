import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/common/Logo";
import { ShieldIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Sign in · forlivf",
  description: "Secure access to the forlivf lab operating system.",
};

export default function LoginPage() {
  return (
    <main className="w-full max-w-[26rem]">
      <div className="mb-7 text-center">
        <Logo size="lg" />
        <h1 className="mt-6 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
          Sign in to your lab
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft text-balance">
          The intelligence layer for embryology teams — on the equipment you
          already own.
        </p>
      </div>

      <div className="rounded-3xl border border-line bg-surface/85 p-6 shadow-[0_2px_24px_rgba(22,21,28,0.06)] backdrop-blur-sm sm:p-7">
        <LoginForm />
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <ShieldIcon className="h-3.5 w-3.5" />
        <span>Access is logged and audited per centre policy.</span>
      </div>

      <p className="mt-4 text-center text-[0.8125rem] text-ink-soft">
        No account yet?{" "}
        <Link
          href="/request-access"
          className="font-medium text-brand-600 underline-offset-4 hover:underline"
        >
          Request centre access
        </Link>
      </p>
    </main>
  );
}
