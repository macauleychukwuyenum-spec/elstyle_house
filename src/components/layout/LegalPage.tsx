import type { ReactNode } from "react";
import { SiteShell } from "./SiteShell";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-[760px] px-6 py-16 md:py-20">
        <h1 className="mb-8 font-serif text-5xl font-medium">{title}</h1>
        <div className="space-y-5 leading-relaxed text-muted-warm">{children}</div>
      </div>
    </SiteShell>
  );
}