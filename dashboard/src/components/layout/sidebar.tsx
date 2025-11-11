"use client";

import { useState, type ComponentType } from "react";
import { LayoutDashboard, LogOut, PenSquare, Settings, UserRound } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type SidebarNavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: SidebarNavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "New Post",
    href: "/dashboard/posts/new",
    icon: PenSquare,
  },
];

export type DashboardSidebarProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

function SidebarContent({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  const emailLabel = user.email ?? "Signed in user";

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{user.name ?? "Member"}</p>
          <p className="text-xs text-muted-foreground">{emailLabel}</p>
        </div>
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("justify-start gap-2", isActive && "bg-secondary text-secondary-foreground")}
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          );
        })}
      </nav>
      <Separator />
      <div className="px-4 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Account settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function DesktopSidebar({ user }: DashboardSidebarProps) {
  return (
    <aside className="hidden h-full w-64 flex-none border-r border-border/60 bg-background/80 backdrop-blur md:block">
      <SidebarContent user={user} />
    </aside>
  );
}

export function MobileSidebar({ user }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <UserRound className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SidebarContent user={user} />
      </SheetContent>
    </Sheet>
  );
}

