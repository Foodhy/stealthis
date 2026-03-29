import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/cn";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toastWithId = { ...newToast, id };

    setToasts((prev) => [...prev, toastWithId]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>
  );
};

export const Toaster: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-xl border border-border/60 p-4 pr-6 shadow-xl transition-all",
            "bg-background text-foreground",
            toast.variant === "destructive" &&
              "destructive border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
          )}
        >
          <div className="grid gap-1">
            {toast.title && (
              <div className="text-sm font-semibold [&+div]:text-xs">{toast.title}</div>
            )}
            {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
