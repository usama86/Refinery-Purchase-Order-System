import type { CatalogItem, DraftHeader, PurchaseOrderDraft } from "@/lib/types";

const today = new Date();
const defaultNeededBy = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 14)
  .toISOString()
  .slice(0, 10);

export const DEFAULT_DRAFT_HEADER: DraftHeader = {
  requestor: "Alex Morgan",
  costCenter: "CC-1234",
  neededBy: defaultNeededBy,
  paymentTerms: "Net 30"
};

export const createEmptyDraft = (): PurchaseOrderDraft => ({
  supplier: null,
  lines: [],
  header: DEFAULT_DRAFT_HEADER,
  updatedAt: new Date().toISOString()
});

export type AddLineResult =
  | { ok: true; draft: PurchaseOrderDraft; message: string }
  | { ok: false; draft: PurchaseOrderDraft; message: string };

export function getDraftTotal(draft: PurchaseOrderDraft) {
  return draft.lines.reduce(
    (total, line) => total + line.quantity * line.itemSnapshot.priceUsd,
    0
  );
}

export function getDraftLineCount(draft: PurchaseOrderDraft) {
  return draft.lines.reduce((count, line) => count + line.quantity, 0);
}

export function addItemToDraft(
  draft: PurchaseOrderDraft,
  item: CatalogItem
): AddLineResult {
  if (draft.supplier && draft.supplier !== item.supplier) {
    return {
      ok: false,
      draft,
      message: `This draft is locked to ${draft.supplier}. Start a new draft to buy from ${item.supplier}.`
    };
  }

  const existing = draft.lines.find((line) => line.itemId === item.id);
  const lines = existing
    ? draft.lines.map((line) =>
        line.itemId === item.id ? { ...line, quantity: line.quantity + 1 } : line
      )
    : [...draft.lines, { itemId: item.id, quantity: 1, itemSnapshot: item }];

  return {
    ok: true,
    message: existing ? "Quantity increased." : "Item added to draft.",
    draft: {
      ...draft,
      supplier: draft.supplier ?? item.supplier,
      lines,
      updatedAt: new Date().toISOString()
    }
  };
}

export function updateDraftQuantity(
  draft: PurchaseOrderDraft,
  itemId: string,
  quantity: number
) {
  const lines = draft.lines
    .map((line) =>
      line.itemId === itemId
        ? { ...line, quantity: Math.max(0, Math.floor(quantity)) }
        : line
    )
    .filter((line) => line.quantity > 0);

  return {
    ...draft,
    supplier: lines.length ? draft.supplier : null,
    lines,
    updatedAt: new Date().toISOString()
  };
}

export function updateDraftHeader(
  draft: PurchaseOrderDraft,
  header: DraftHeader
) {
  return {
    ...draft,
    header,
    updatedAt: new Date().toISOString()
  };
}
