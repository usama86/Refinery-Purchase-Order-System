import { clearDraft, loadDraftId, saveDraftId } from "@/lib/storage";
import type {
  CatalogItem,
  DraftHeader,
  PoStatus,
  PurchaseOrder,
  PurchaseOrderDraft
} from "@/lib/types";

const procurementApiBaseUrl =
  process.env.NEXT_PUBLIC_PROCUREMENT_API_BASE_URL ?? "http://localhost:8002";

type ApiOrder = {
  id: string;
  poNumber: string | null;
  supplier: string | null;
  status: "Draft" | "Submitted" | "Approved" | "Rejected" | "Fulfilled";
  header: DraftHeader;
  lines: Array<{
    id: string;
    itemId: string;
    quantity: number;
    supplier: string;
    itemSnapshot: CatalogItem;
    priceUsdSnapshot: number | string | null;
    leadTimeDaysSnapshot: number | null;
  }>;
  totalUsd: number | string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    id: string;
    status: "Draft" | "Submitted" | "Approved" | "Rejected" | "Fulfilled";
    at: string;
    actor: string;
    note: string;
  }>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${procurementApiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? "Procurement request failed.");
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function normalizeItem(item: CatalogItem): CatalogItem {
  return {
    ...item,
    priceUsd: Number(item.priceUsd)
  };
}

function toDraft(order: ApiOrder): PurchaseOrderDraft {
  return {
    id: order.id,
    supplier: order.supplier,
    status: "Draft",
    header: order.header,
    updatedAt: order.updatedAt,
    lines: order.lines.map((line) => ({
      id: line.id,
      itemId: line.itemId,
      quantity: line.quantity,
      itemSnapshot: normalizeItem(line.itemSnapshot),
      priceUsdSnapshot:
        line.priceUsdSnapshot === null ? null : Number(line.priceUsdSnapshot),
      leadTimeDaysSnapshot: line.leadTimeDaysSnapshot
    }))
  };
}

function toPurchaseOrder(order: ApiOrder): PurchaseOrder {
  if (!order.poNumber || !order.submittedAt || order.status === "Draft") {
    throw new Error("Submitted purchase order response is incomplete.");
  }

  return {
    id: order.id,
    poNumber: order.poNumber,
    supplier: order.supplier ?? "",
    status: order.status as PoStatus,
    header: order.header,
    lines: toDraft(order).lines,
    totalUsd: Number(order.totalUsd),
    submittedAt: order.submittedAt,
    timeline: order.timeline
      .filter((event) => event.status !== "Draft")
      .map((event) => ({
        status: event.status as PoStatus,
        at: event.at,
        actor: event.actor,
        note: event.note
      }))
  };
}

export async function getOrCreateDraft() {
  const draftId = loadDraftId();
  if (draftId) {
    try {
      return toDraft(await request<ApiOrder>(`/procurement/purchase-orders/${draftId}`));
    } catch {
      clearDraft();
    }
  }

  const order = await request<ApiOrder>("/procurement/purchase-orders", {
    method: "POST",
    body: JSON.stringify({})
  });
  saveDraftId(order.id);
  return toDraft(order);
}

export async function addDraftLine(draftId: string, itemId: string) {
  return toDraft(
    await request<ApiOrder>(`/procurement/purchase-orders/${draftId}/lines`, {
      method: "POST",
      body: JSON.stringify({ itemId, quantity: 1 })
    })
  );
}

export async function updateDraftLineQuantity(
  draft: PurchaseOrderDraft,
  itemId: string,
  quantity: number
) {
  const line = draft.lines.find((candidate) => candidate.itemId === itemId);
  if (!draft.id || !line?.id) throw new Error("Draft line could not be found.");
  return toDraft(
    await request<ApiOrder>(`/procurement/purchase-orders/${draft.id}/lines/${line.id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity })
    })
  );
}

export async function updateDraftHeader(draftId: string, header: DraftHeader) {
  return toDraft(
    await request<ApiOrder>(`/procurement/purchase-orders/${draftId}/header`, {
      method: "PATCH",
      body: JSON.stringify(header)
    })
  );
}

export async function listPurchaseOrders() {
  const orders = await request<ApiOrder[]>("/procurement/purchase-orders");
  return orders.map(toPurchaseOrder);
}

export async function getPurchaseOrder(poNumber: string) {
  try {
    return toPurchaseOrder(
      await request<ApiOrder>(`/procurement/purchase-orders/${poNumber}`)
    );
  } catch {
    return null;
  }
}

export async function submitDraft(draft: PurchaseOrderDraft) {
  if (!draft.id) throw new Error("Draft was not initialized.");
  const order = toPurchaseOrder(
    await request<ApiOrder>(`/procurement/purchase-orders/${draft.id}/submit`, {
      method: "POST",
      headers: {
        "Idempotency-Key": `submit-${draft.id}`
      }
    })
  );
  clearDraft();
  return order;
}

export async function transitionPurchaseOrder(
  order: PurchaseOrder,
  action: "approve" | "reject" | "fulfill"
) {
  const orderId = order.id ?? order.poNumber;
  const actor = action === "fulfill" ? order.supplier : "Approvals Desk";
  const response = await request<ApiOrder>(
    `/procurement/purchase-orders/${orderId}/${action}`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": `${action}-${orderId}`
      },
      body: JSON.stringify({ actor })
    }
  );
  return toPurchaseOrder(response);
}
