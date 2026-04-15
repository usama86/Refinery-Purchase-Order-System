"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Factory, FileText, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const navItems = [
  { href: "/catalog", label: "Catalog", icon: ShoppingCart },
  { href: "/draft/header", label: "Draft", icon: FileText },
  { href: "/purchase-orders", label: "Purchase Orders", icon: Factory }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/catalog" className="focus-ring flex min-w-0 items-center gap-3 rounded-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <Factory className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Refinery Procurement</p>
              <p className="truncate text-xs text-muted-foreground">Buyer workspace</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <nav
              className="flex items-center gap-1 rounded-md border bg-card/75 p-1 shadow-sm"
              aria-label="Primary"
            >
              {navItems.map((item) => {
                const active =
                  item.href === "/catalog"
                    ? pathname === "/catalog"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring flex h-8 items-center gap-2 rounded px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      active && "bg-background text-foreground shadow-sm"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:py-7">
        {children}
      </main>
    </div>
  );
}
