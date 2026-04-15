import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-client";
import { AppShell } from "@/components/common/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Refinery Purchase Orders",
  description: "Buyer-facing refinery purchase order workflow"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
