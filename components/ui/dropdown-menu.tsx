"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
});

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = () => setOpen(false);
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
}

function DropdownMenuContent({
  className,
  align = "start",
  children,
  ...props
}: DropdownMenuContentProps) {
  const { open } = React.useContext(DropdownMenuContext);

  if (!open) return null;

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-border-subtle bg-elevated p-1 shadow-lg",
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-text-primary outline-none transition-colors hover:bg-hover focus:bg-hover",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-border-subtle", className)}
      {...props}
    />
  );
}

function DropdownMenuLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold text-text-secondary", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
