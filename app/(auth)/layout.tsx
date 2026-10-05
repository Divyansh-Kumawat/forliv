import type { ReactNode } from "react";

import { AmbientBackdrop } from "@/components/common/AmbientBackdrop";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <AmbientBackdrop />
      <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-12">
        {children}
      </div>
    </div>
  );
}
