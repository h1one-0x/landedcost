"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
    } else {
      setChecked(true);
    }
  }, [user, loading, router]);

  if (loading || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1">{children}</main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
