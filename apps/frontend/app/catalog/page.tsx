import { Suspense } from "react";
import { CatalogPage } from "@/components/catalog/catalog-page";
import { TableSkeleton } from "@/components/common/loading-state";

export default function CatalogRoute() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <CatalogPage />
    </Suspense>
  );
}
