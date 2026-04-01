"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Package, Download, Loader2 } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import ShipmentHistoryCard from "@/components/shipments/ShipmentHistoryCard";
import ShipmentHistoryFilters from "@/components/shipments/ShipmentHistoryFilters";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { listShipments } from "@/lib/supabase-db";

interface Filters {
  search: string;
  containerType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  viewMode: "grid" | "list";
}

interface ShipmentRow {
  id: string;
  name: string;
  created_at: string;
  container_type: string;
  origin_port: string;
  destination_port: string;
  status: string;
  share_token?: string;
  item_count: number;
  total_cbm: number;
  grand_total: number;
}

export default function ShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadShipments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listShipments(user.id);
      setShipments(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    containerType: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
    viewMode: "grid",
  });

  const filtered = useMemo(() => {
    let result = [...shipments];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (filters.containerType !== "all") {
      result = result.filter((s) => s.container_type === filters.containerType);
    }
    if (filters.status !== "all") {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      result = result.filter((s) => new Date(s.created_at) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((s) => new Date(s.created_at) <= to);
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "total":
          return (b.grand_total ?? 0) - (a.grand_total ?? 0);
        case "date":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [filters, shipments]);

  const totalLanded = shipments.reduce((s, x) => s + (x.grand_total ?? 0), 0);
  const avgPerShipment = shipments.length > 0 ? totalLanded / shipments.length : 0;

  if (loading) {
    return (
      <div className="flex flex-col">
        <TopBar breadcrumbs={[{ label: "Dashboard", href: "/app" }, { label: "Shipments" }]} />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <TopBar
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Shipments" },
        ]}
      />

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Shipments</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Manage and review all your landed cost calculations.
            </p>
          </div>
        </div>

        {/* Summary Stats Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-6 rounded-lg border border-border-subtle bg-surface px-6 py-4 text-sm">
          <div>
            <span className="text-text-secondary">Total shipments: </span>
            <span className="font-semibold text-text-primary">{shipments.length}</span>
          </div>
          <div className="h-4 w-px bg-border-subtle" />
          <div>
            <span className="text-text-secondary">Total landed costs: </span>
            <span className="font-semibold text-accent">{formatCurrency(totalLanded)}</span>
          </div>
          <div className="h-4 w-px bg-border-subtle" />
          <div>
            <span className="text-text-secondary">Avg per shipment: </span>
            <span className="font-semibold text-text-primary">{formatCurrency(avgPerShipment)}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4">
          <ShipmentHistoryFilters onFilterChange={setFilters} />
        </div>

        {/* Shipment Cards */}
        {filtered.length > 0 ? (
          <div
            className={
              filters.viewMode === "grid"
                ? "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "mt-6 flex flex-col gap-3"
            }
          >
            {filtered.map((shipment) => (
              <ShipmentHistoryCard key={shipment.id} shipment={shipment} onRefresh={loadShipments} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border-subtle bg-surface px-6 py-16 text-center">
            <Package className="h-10 w-10 text-text-secondary" />
            <p className="mt-4 text-text-secondary">
              {shipments.length === 0
                ? "No shipments yet. Create your first shipment!"
                : "No shipments match your current filters."}
            </p>
            {shipments.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    search: "",
                    containerType: "all",
                    status: "all",
                    dateFrom: "",
                    dateTo: "",
                    sortBy: "date",
                    viewMode: filters.viewMode,
                  })
                }
                className="mt-4 text-sm text-accent hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
