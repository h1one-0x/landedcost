import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="group relative inline-flex">
      {children}
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 hidden rounded-md bg-background px-3 py-1.5 text-xs text-text-primary shadow-md border border-border-subtle group-hover:block whitespace-nowrap",
          positionClasses[side],
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}

export { Tooltip };
