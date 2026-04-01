"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Ship,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/supabase-db";

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "New Shipment", href: "/app/new-shipment", icon: Plus },
  { label: "Shipments", href: "/app/shipments", icon: Ship },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/auth/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border-subtle bg-surface">
      {/* Logo */}
      <div className="flex h-14 items-center px-6">
        <Link href="/app" className="text-xl font-serif text-accent">
          LandedCost
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-l-2 border-accent bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-hover hover:text-text-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* New Shipment CTA */}
      <div className="px-3 pb-4">
        <Link
          href="/app/new-shipment"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg-base transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Shipment
        </Link>
      </div>

      {/* User area */}
      <div className="border-t border-border-subtle px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-text-secondary">
            <User className="h-4 w-4" />
          </div>
          <span className="flex-1 truncate text-sm text-text-secondary">
            {user?.email ?? "Loading..."}
          </span>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
