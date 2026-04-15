import { clearDraft, loadPurchaseOrders, savePurchaseOrders } from "@/lib/storage";
import type { PoStatus, PurchaseOrder, PurchaseOrderDraft } from "@/lib/types";
import { getDraftTotal } from "@/lib/draft";

const statusNotes: Record<PoStatus, string> = {
  Submitted: "Purchase order submitted by Buyer.",
  Approved: "Commercial approval captured for planning visibility.",
  Rejected: "Rejected by approval desk. Buyer review required.",
  Fulfilled: "Supplier fulfillment completed and received."
};

function generatePoNumber() {
  const sequence = String(loadPurchaseOrders().length + 1).padStart(4, "0");
  return `PO-2026-${sequence}`;
}

export async function listPurchaseOrders() {
  await new Promise((resolve) => setTimeout(resolve, 220));
  return loadPurchaseOrders().sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );
}

export async function getPurchaseOrder(poNumber: string) {
  await new Promise((resolve) => setTimeout(resolve, 220));
  return loadPurchaseOrders().find((order) => order.poNumber === poNumber) ?? null;
}

export async function submitDraft(draft: PurchaseOrderDraft) {
  await new Promise((resolve) => setTimeout(resolve, 850));

  if (!draft.supplier || draft.lines.length === 0) {
    throw new Error("A purchase order needs at least one line item.");
  }

  const submittedAt = new Date().toISOString();
  const order: PurchaseOrder = {
    poNumber: generatePoNumber(),
    supplier: draft.supplier,
    status: "Submitted",
    header: draft.header,
    lines: draft.lines,
    totalUsd: getDraftTotal(draft),
    submittedAt,
    timeline: [
      {
        status: "Submitted",
        at: submittedAt,
        actor: draft.header.requestor,
        note: statusNotes.Submitted
      },
      {
        status: "Approved",
        at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        actor: "Approvals Desk",
        note: statusNotes.Approved
      },
      {
        status: "Fulfilled",
        at: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
        actor: draft.supplier,
        note: statusNotes.Fulfilled
      }
    ]
  };

  savePurchaseOrders([order, ...loadPurchaseOrders()]);
  clearDraft();
  return order;
}
