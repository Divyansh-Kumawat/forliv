"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/hooks/useAuth";

/**
 * Client-side gate over the placeholder session. When auth moves to an httpOnly
 * cookie this should be replaced by a proxy/middleware redirect so unauthenticated
 * users never receive the shell at all.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="animate-pulse">
          <Logo size="md" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
