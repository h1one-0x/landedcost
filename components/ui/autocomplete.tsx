"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AutocompleteOption {
  label: string;
  value: string;
  sublabel?: string;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
}

export function Autocomplete({ value, onChange, options, placeholder, className }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<AutocompleteOption[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filterOptions = useCallback(
    (query: string) => {
      if (!query) return options.slice(0, 10);
      const lower = query.toLowerCase();
      return options.filter(
        (o) => o.label.toLowerCase().includes(lower) || (o.sublabel && o.sublabel.toLowerCase().includes(lower))
      );
    },
    [options]
  );

  useEffect(() => {
    setFiltered(filterOptions(value));
  }, [value, filterOptions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        listRef.current && !listRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors",
          className
        )}
      />
      {isOpen && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border-subtle bg-elevated shadow-lg"
        >
          {filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-hover transition-colors text-left"
              onClick={() => {
                onChange(option.label);
                setIsOpen(false);
              }}
            >
              <span className="flex-1">{option.label}</span>
              {option.sublabel && (
                <span className="text-xs text-text-muted font-mono">{option.sublabel}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
