"use client";

import Link from "next/link";
import { Eye, Copy, Archive, Share2, Package, Box, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { archiveShipment, duplicateShipment } from "@/lib/supabase-db";

interface ShipmentCardData {
  id: string;
  name: string;
  created_at: string;
  container_type: string;
  origin_port: string;
  destination_port: string;
  status: string;
  share_token?: string;
  item_count?: number;
  total_cbm?: number;
  grand_total?: number;
}

interface ShipmentHistoryCardProps {
  shipment: ShipmentCardData;
  onRefresh?: () => void;
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return <Badge variant="success">Confirmed</Badge>;
    case "archived":
      return <Badge variant="warning">Archived</Badge>;
    case "draft":
    default:
      return <Badge variant="secondary">Draft</Badge>;
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ShipmentHistoryCard({ shipment, onRefresh }: ShipmentHistoryCardProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (!shipment.share_token) return;
    const url = `${window.location.origin}/share/${shipment.share_token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleArchive() {
    if (busy) return;
    setBusy(true);
    try {
      await archiveShipment(shipment.id);
      onRefresh?.();
    } finally {
      setBusy(false);
    }
  }

  async function handleDuplicate() {
    if (busy || !user) return;
    setBusy(true);
    try {
      await duplicateShipment(shipment.id, user.id);
      onRefresh?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="group transition-all hover:border-accent/30 hover:shadow-md hover:shadow-accent/5">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {shipment.name}
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              {formatDate(shipment.created_at)}
            </p>
          </div>
          {getStatusBadge(shipment.status)}
        </div>

        {/* Container Type */}
        <div className="mt-3">
          <Badge variant="info" className="text-[10px]">
            <Box className="mr-1 h-3 w-3" />
            {shipment.container_type}
          </Badge>
        </div>

        {/* Route */}
        <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
          <span className="truncate">{shipment.origin_port}</span>
          <ArrowRight className="h-3 w-3 flex-shrink-0 text-accent" />
          <span className="truncate">{shipment.destination_port}</span>
        </div>

        {/* Product count + CBM */}
        <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {shipment.item_count ?? 0} products
          </span>
          <span>{(shipment.total_cbm ?? 0).toFixed(2)} CBM</span>
        </div>

        {/* Grand Total */}
        <div className="mt-4 border-t border-border-subtle pt-3">
          <p className="text-xs text-text-secondary">Grand Total</p>
          <p className="mt-0.5 font-mono text-xl font-bold text-accent">
            {formatCurrency(shipment.grand_total ?? 0)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-1 border-t border-border-subtle pt-3">
          <Link
            href={`/app/new-shipment?load=${shipment.id}`}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
