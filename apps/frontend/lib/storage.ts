import { createEmptyDraft } from "@/lib/draft";
import type { PurchaseOrder, PurchaseOrderDraft } from "@/lib/types";

const DRAFT_KEY = "refinery.po.draft";
const PURCHASE_ORDERS_KEY = "refinery.purchaseOrders";

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function loadDraft(): PurchaseOrderDraft {
  if (!canUseStorage()) return createEmptyDraft();

  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as PurchaseOrderDraft) : createEmptyDraft();
  } catch {
    return createEmptyDraft();
  }
}

export function saveDraft(draft: PurchaseOrderDraft) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function loadPurchaseOrders(): PurchaseOrder[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(PURCHASE_ORDERS_KEY);
    return raw ? (JSON.parse(raw) as PurchaseOrder[]) : [];
  } catch {
    return [];
  }
}

export function savePurchaseOrders(orders: PurchaseOrder[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(PURCHASE_ORDERS_KEY, JSON.stringify(orders));
}
