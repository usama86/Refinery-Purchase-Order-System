"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-md border bg-card text-card-foreground shadow-lg",
          closeButton:
            "!right-2 !top-2 !left-auto !h-7 !w-7 !translate-x-0 !translate-y-0 rounded-md border border-border bg-background text-foreground opacity-90 shadow-sm transition-colors hover:bg-muted hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground"
        }
      }}
    />
  );
}
