import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardMain } from "@/components/layout/dashboard-main";
import { DesktopSidebar, MobileSidebar } from "@/components/layout/sidebar";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <DesktopSidebar user={user} />

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur md:hidden">
          <MobileSidebar user={user} />
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pulse Dashboard
          </span>
        </header>
        <DashboardMain>{children}</DashboardMain>
      </div>
    </div>
  );
}

