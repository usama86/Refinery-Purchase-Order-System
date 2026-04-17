"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CatalogActionRow } from "@/components/catalog/catalog-action-row";
import { CatalogBreadcrumbHeader } from "@/components/catalog/catalog-breadcrumb-header";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogTable } from "@/components/catalog/catalog-table";
import { DraftSummaryCard } from "@/components/draft/draft-summary-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { TableSkeleton } from "@/components/common/loading-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  catalogQueryToParams,
  DEFAULT_CATALOG_QUERY,
  listCatalogCategories,
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
  const debouncedSearch = useDebounce(query.search, 320);
  const effectiveQuery = useMemo(
    () => ({ ...query, search: debouncedSearch }),
    [debouncedSearch, query]
  );
  const { draft, addItem } = useDraft();

  const categoriesQuery = useQuery({
    queryKey: ["catalog-categories"],
    queryFn: listCatalogCategories
  });

  const catalogQuery = useQuery({
    queryKey: ["catalog", effectiveQuery],
    queryFn: () => searchCatalog(effectiveQuery)
  });

  useEffect(() => {
    const params = catalogQueryToParams(effectiveQuery);
    const next = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(next, { scroll: false });
  }, [effectiveQuery, pathname, router]);

  const result = catalogQuery.data;
  const items = result?.items ?? [];
  const total = result?.total ?? 0;
  const page = result?.page ?? effectiveQuery.page;
  const totalPages = result?.totalPages ?? 1;
  const activeFilterCount =
    (query.category !== "all" ? 1 : 0) + (query.inStockOnly ? 1 : 0);
  const noFilters =
    effectiveQuery.search === DEFAULT_CATALOG_QUERY.search &&
    effectiveQuery.category === DEFAULT_CATALOG_QUERY.category &&
    effectiveQuery.inStockOnly === DEFAULT_CATALOG_QUERY.inStockOnly;

  const updateQuery = (nextQuery: CatalogQuery) => {
    setQuery(nextQuery);
  };

  const resetQuery = () => {
    setQuery(DEFAULT_CATALOG_QUERY);
  };

  const clearFilters = () => {
    setQuery({
      ...query,
      category: DEFAULT_CATALOG_QUERY.category,
      inStockOnly: DEFAULT_CATALOG_QUERY.inStockOnly,
      page: 1
    });
  };

  return (
    <div>
      <CatalogBreadcrumbHeader
        info="Compare approved refinery equipment and build a single-supplier purchase order draft."
        total={total}
        loading={catalogQuery.isFetching}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0 space-y-3" aria-labelledby="catalog-results-title">
          <CatalogActionRow
            query={query}
            categories={categoriesQuery.data ?? []}
            activeFilterCount={activeFilterCount}
            onChange={updateQuery}
            onReset={resetQuery}
            onClearFilters={clearFilters}
          />
          {catalogQuery.isLoading ? <TableSkeleton /> : null}
          {catalogQuery.isError ? (
            <ErrorState
              title="Catalog unavailable"
              message="The catalog service could not return items."
            />
          ) : null}
          {catalogQuery.isSuccess && items.length === 0 ? (
            <EmptyState
              title={noFilters ? "No catalog items available" : "No matching items"}
              description={
                noFilters
                  ? "The catalog service did not return any refinery items."
                  : "Adjust the search, category, stock filter, or sort order to broaden the result set."
              }
            />
          ) : null}
          {catalogQuery.isSuccess && items.length > 0 ? (
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-col gap-2 border-b bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle id="catalog-results-title">Approved items</CardTitle>
                  <CardDescription>
                    Pricing and lead times are snapshotted at submission.
                  </CardDescription>
                </div>
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  {draft.supplier
                    ? `Draft supplier: ${draft.supplier}`
                    : "No supplier lock yet"}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <CatalogTable
                  items={items}
                  supplierLock={draft.supplier}
                  sort={query.sort}
                  onSortChange={(sort) => setQuery({ ...query, sort, page: 1 })}
                  onAdd={async (item) => {
                    const result = await addItem(item);
                    if (result.ok) {
                      toast.success(result.message, {
                        description: item.name
                      });
                    } else {
                      toast.error("Supplier mismatch blocked", {
                        description: result.message
                      });
                    }
                  }}
                />
              </CardContent>
              <CatalogPagination
                page={page}
                pageSize={effectiveQuery.pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={(nextPage) => setQuery({ ...query, page: nextPage })}
                onPageSizeChange={(pageSize) =>
                  setQuery({ ...query, pageSize, page: 1 })
                }
              />
            </Card>
          ) : null}
        </section>
        <aside className="xl:pt-0">
          <DraftSummaryCard draft={draft} />
        </aside>
      </div>
    </div>
  );
}
