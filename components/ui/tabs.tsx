"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
});

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const activeTab = value ?? uncontrolled;
  const setActiveTab = onValueChange ?? setUncontrolled;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center gap-1 border-b border-border-subtle w-full",
      className
    )}
    role="tablist"
    {...props}
  />
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { activeTab, setActiveTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all -mb-[1px] border-b-2",
          isActive
            ? "border-accent text-accent"
            : "border-transparent text-text-muted hover:text-text-secondary hover:border-border-subtle",
          className
        )}
        onClick={() => setActiveTab(value)}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { activeTab } = React.useContext(TabsContext);

    if (activeTab !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn("mt-4", className)}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
