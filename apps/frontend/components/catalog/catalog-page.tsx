"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { CatalogTable } from "@/components/catalog/catalog-table";
import { DraftSummaryCard } from "@/components/draft/draft-summary-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/loading-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  catalogQueryToParams,
  DEFAULT_CATALOG_QUERY,
  getCatalogCategories,
  parseCatalogQuery,
  searchCatalog
} from "@/lib/catalog";
import { useDebounce } from "@/lib/use-debounce";
import { useDraft } from "@/lib/use-draft";
import type { CatalogQuery } from "@/lib/types";

export function CatalogPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState<CatalogQuery>(() =>
    parseCatalogQuery(searchParams)
  );
  const debouncedQuery = useDebounce(query, 320);
  const categories = useMemo(() => getCatalogCategories(), []);
  const { draft, addItem, message, clearMessage } = useDraft();

  const catalogQuery = useQuery({
    queryKey: ["catalog", debouncedQuery],
    queryFn: () => searchCatalog(debouncedQuery)
  });

  useEffect(() => {
    const params = catalogQueryToParams(debouncedQuery);
    const next = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(next, { scroll: false });
  }, [debouncedQuery, pathname, router]);

  const items = catalogQuery.data ?? [];
  const noFilters =
    debouncedQuery.search === DEFAULT_CATALOG_QUERY.search &&
    debouncedQuery.category === DEFAULT_CATALOG_QUERY.category &&
    debouncedQuery.inStockOnly === DEFAULT_CATALOG_QUERY.inStockOnly;

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Refinery equipment catalog"
        description="Search approved refinery items, compare commercial terms, and build a single-supplier purchase order draft."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <CatalogToolbar
            query={query}
            categories={categories}
            resultCount={items.length}
            loading={catalogQuery.isFetching}
            onChange={setQuery}
          />
          {message ? (
            <div
              className="mb-4 flex items-center justify-between rounded-md border bg-card p-3 text-sm"
              role="status"
            >
              <span>{message}</span>
              <Button variant="ghost" size="sm" onClick={clearMessage}>
                Dismiss
              </Button>
            </div>
          ) : null}
          {catalogQuery.isLoading ? <TableSkeleton /> : null}
          {catalogQuery.isError ? (
            <ErrorState
              title="Catalog unavailable"
              message="The mock catalog API could not return items."
            />
          ) : null}
          {catalogQuery.isSuccess && items.length === 0 ? (
            <EmptyState
              title={noFilters ? "No catalog items available" : "No matching items"}
              description={
                noFilters
                  ? "The local dataset did not return any refinery items."
                  : "Adjust the search, category, stock filter, or sort order to broaden the result set."
              }
            />
          ) : null}
          {catalogQuery.isSuccess && items.length > 0 ? (
            <CatalogTable
              items={items}
              supplierLock={draft.supplier}
              onAdd={(item) => addItem(item)}
            />
          ) : null}
        </section>
        <aside>
          <DraftSummaryCard draft={draft} />
        </aside>
      </div>
    </div>
  );
}
