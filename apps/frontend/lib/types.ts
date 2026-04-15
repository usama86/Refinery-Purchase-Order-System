export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  supplier: string;
  manufacturer: string;
  model: string;
  description: string;
  leadTimeDays: number;
  priceUsd: number;
  inStock: boolean;
  specs: Record<string, string>;
  compatibleWith?: string[];
};

export type CatalogSort =
  | "price-asc"
  | "price-desc"
  | "lead-asc"
  | "lead-desc"
  | "supplier-asc";

export type CatalogQuery = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sort: CatalogSort;
  page: number;
  pageSize: number;
};

export type CatalogSearchResult = {
  items: CatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DraftLine = {
  itemId: string;
  quantity: number;
  itemSnapshot: CatalogItem;
};

export type DraftHeader = {
  requestor: string;
  costCenter: string;
  neededBy: string;
  paymentTerms: string;
};

export type PurchaseOrderDraft = {
  supplier: string | null;
  lines: DraftLine[];
  header: DraftHeader;
  updatedAt: string;
};

export type PoStatus = "Submitted" | "Approved" | "Rejected" | "Fulfilled";

export type StatusEvent = {
  status: PoStatus;
  at: string;
  actor: string;
  note: string;
};

export type PurchaseOrder = {
  poNumber: string;
  supplier: string;
  status: PoStatus;
  header: DraftHeader;
  lines: DraftLine[];
  totalUsd: number;
  submittedAt: string;
  timeline: StatusEvent[];
};
