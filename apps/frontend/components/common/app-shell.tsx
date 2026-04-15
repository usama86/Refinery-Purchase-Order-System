"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory, FileText, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/catalog", label: "Catalog", icon: ShoppingCart },
  { href: "/draft/header", label: "Draft", icon: FileText },
  { href: "/purchase-orders", label: "Purchase Orders", icon: Factory }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3">
          <Link href="/catalog" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Factory className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Refinery Procurement</p>
              <p className="text-xs text-muted-foreground">Buyer workspace</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "focus-ring flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-5 py-6">{children}</main>
    </div>
  );
}
