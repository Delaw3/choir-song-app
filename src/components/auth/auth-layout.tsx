import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-[420px]">
        {children}
      </div>
    </main>
  );
}
