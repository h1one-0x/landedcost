"use client";

import Link from "next/link";
import { Save, Download, Share2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface TopBarProps {
  breadcrumbs: Breadcrumb[];
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  lastSaved?: Date;
}

export default function TopBar({
  breadcrumbs,
  onSave,
  onExport,
  onShare,
  lastSaved,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast ? "text-text-primary font-medium" : "text-text-secondary"
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {lastSaved && (
          <span className="mr-2 text-xs text-text-secondary">
            Last saved {lastSaved.toLocaleTimeString()}
          </span>
        )}

        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}

        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-elevated hover:text-text-primary"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        )}
      </div>
    </header>
  );
}
