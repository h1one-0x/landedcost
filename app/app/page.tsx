"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, DollarSign, TrendingUp, FileEdit, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getDashboardStats, listShipments } from "@/lib/supabase-db";
import { formatCurrency } from "@/lib/utils";
import ShipmentHistoryCard from "@/components/shipments/ShipmentHistoryCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalShipments: 0, totalLanded: 0, avgPerShipment: 0, drafts: 0 });
  const [recentShipments, setRecentShipments] = useState<Awaited<ReturnType<typeof listShipments>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getDashboardStats(user.id),
      listShipments(user.id),
    ]).then(([s, shipments]) => {
      setStats(s);
      setRecentShipments(shipments.slice(0, 3));
    }).finally(() => setLoading(false));
  }, [user]);

  const statCards = [
    { label: "Total Shipments", value: String(stats.totalShipments), icon: Package },
    { label: "Total Landed Costs", value: formatCurrency(stats.totalLanded), icon: DollarSign },
    { label: "Avg Cost per Shipment", value: formatCurrency(stats.avgPerShipment), icon: TrendingUp },
    { label: "Active Drafts", value: String(stats.drafts), icon: FileEdit },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Overview of your shipments and landed cost calculations.
      </p>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-border-subtle bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{stat.label}</span>
                <Icon className="h-4 w-4 text-text-secondary" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Shipments */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Recent Shipments</h2>
          {recentShipments.length > 0 && (
            <Link href="/app/shipments" className="text-sm text-accent hover:underline">
              View all
            </Link>
          )}
        </div>

        {recentShipments.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentShipments.map((shipment) => (
              <ShipmentHistoryCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-border-subtle bg-surface px-6 py-16 text-center">
            <Package className="h-10 w-10 text-text-secondary" />
            <p className="mt-4 text-text-secondary">
              No shipments yet. Create your first shipment to get started.
            </p>
            <Link
              href="/app/new-shipment"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg-base transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Shipment
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
