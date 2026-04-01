"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "REMOVE"; id: string };

const TOAST_TIMEOUT = 3000;

let listeners: Array<(action: ToastAction) => void> = [];

function dispatch(action: ToastAction) {
  listeners.forEach((listener) => listener(action));
}

let toastCount = 0;

function toast(message: string, variant: ToastVariant = "info") {
  const id = String(++toastCount);
  dispatch({ type: "ADD", toast: { id, message, variant } });
  setTimeout(() => {
    dispatch({ type: "REMOVE", id });
  }, TOAST_TIMEOUT);
  return id;
}

toast.success = (message: string) => toast(message, "success");
toast.error = (message: string) => toast(message, "error");
toast.info = (message: string) => toast(message, "info");

function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const listener = (action: ToastAction) => {
      setToasts((prev) => {
        switch (action.type) {
          case "ADD":
            return [...prev, action.toast];
          case "REMOVE":
            return prev.filter((t) => t.id !== action.id);
          default:
            return prev;
        }
      });
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return { toasts, dismiss: (id: string) => dispatch({ type: "REMOVE", id }) };
}

const variantClasses: Record<ToastVariant, string> = {
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm text-sm",
        "animate-in slide-in-from-right-full fade-in-0",
        variantClasses[t.variant]
      )}
    >
      <span>{t.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(t.id)}
        className="shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

export { toast, useToast, Toaster };
