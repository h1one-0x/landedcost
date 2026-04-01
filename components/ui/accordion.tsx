"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-b border-border-subtle", className)}
      {...props}
    />
  )
);
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  onToggle?: () => void;
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, open, onToggle, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "flex w-full items-center justify-between py-4 text-sm font-medium text-text-primary transition-all hover:text-accent [&>svg]:transition-transform",
      open && "[&>svg]:rotate-180",
      className
    )}
    onClick={onToggle}
    aria-expanded={open}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
  </button>
));
AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, open, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm text-text-secondary transition-all duration-200",
        open ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
      )}
      {...props}
    >
      <div className={className}>{children}</div>
    </div>
  )
);
AccordionContent.displayName = "AccordionContent";

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
}

function Accordion({ className, children, type = "single", ...props }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());

  const toggle = (value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (type === "single") next.clear();
        next.add(value);
      }
      return next;
    });
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<AccordionItemProps>(child)) return child;
        const value = child.props.value;
        const isOpen = openItems.has(value);

        return React.cloneElement(child, {
          children: React.Children.map(
            child.props.children,
            (innerChild) => {
              if (!React.isValidElement(innerChild)) return innerChild;
              if (innerChild.type === AccordionTrigger) {
                return React.cloneElement(
                  innerChild as React.ReactElement<AccordionTriggerProps>,
                  { open: isOpen, onToggle: () => toggle(value) }
                );
              }
              if (innerChild.type === AccordionContent) {
                return React.cloneElement(
                  innerChild as React.ReactElement<AccordionContentProps>,
                  { open: isOpen }
                );
              }
              return innerChild;
            }
          ),
        });
      })}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
