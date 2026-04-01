"use client";

import { useState } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";

interface Filters {
  search: string;
  containerType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  viewMode: "grid" | "list";
}

interface ShipmentHistoryFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export default function ShipmentHistoryFilters({
  onFilterChange,
}: ShipmentHistoryFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    containerType: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    sortBy: "date",
    viewMode: "grid",
  });

  function updateFilter(key: keyof Filters, value: string) {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  }

  function toggleView(mode: "grid" | "list") {
    const updated = { ...filters, viewMode: mode };
    setFilters(updated);
    onFilterChange(updated);
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search shipments..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Container Type */}
        <div className="w-[140px]">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Container
          </label>
          <Select
            value={filters.containerType}
            onChange={(e) => updateFilter("containerType", e.target.value)}
          >
            <SelectOption value="all">All Types</SelectOption>
            <SelectOption value="20ST">20&apos; Standard</SelectOption>
            <SelectOption value="40ST">40&apos; Standard</SelectOption>
            <SelectOption value="40HQ">40&apos; High Cube</SelectOption>
            <SelectOption value="20RF">20&apos; Reefer</SelectOption>
            <SelectOption value="40RF">40&apos; Reefer</SelectOption>
            <SelectOption value="LCL">LCL</SelectOption>
          </Select>
        </div>

        {/* Status */}
        <div className="w-[130px]">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Status
          </label>
          <Select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
          >
            <SelectOption value="all">All</SelectOption>
            <SelectOption value="draft">Draft</SelectOption>
            <SelectOption value="confirmed">Confirmed</SelectOption>
            <SelectOption value="archived">Archived</SelectOption>
          </Select>
        </div>

        {/* Date From */}
        <div className="w-[150px]">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            From
          </label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
          />
        </div>

        {/* Date To */}
        <div className="w-[150px]">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            To
          </label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
          />
        </div>

        {/* Sort By */}
        <div className="w-[140px]">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Sort by
          </label>
          <Select
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
          >
            <SelectOption value="date">Date</SelectOption>
            <SelectOption value="name">Name</SelectOption>
            <SelectOption value="total">Grand Total</SelectOption>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => toggleView("grid")}
            className={`rounded-md p-2.5 transition-colors ${
              filters.viewMode === "grid"
                ? "bg-accent/10 text-accent"
                : "text-text-secondary hover:bg-elevated hover:text-text-primary"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => toggleView("list")}
            className={`rounded-md p-2.5 transition-colors ${
              filters.viewMode === "list"
                ? "bg-accent/10 text-accent"
                : "text-text-secondary hover:bg-elevated hover:text-text-primary"
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
