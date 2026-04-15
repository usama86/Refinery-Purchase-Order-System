"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addItemToDraft,
  createEmptyDraft,
  updateDraftHeader,
  updateDraftQuantity
} from "@/lib/draft";
import { loadDraft, saveDraft } from "@/lib/storage";
import type { CatalogItem, DraftHeader, PurchaseOrderDraft } from "@/lib/types";

export function useDraft() {
  const [draft, setDraft] = useState<PurchaseOrderDraft>(() => createEmptyDraft());
  const [message, setMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
    setHydrated(true);
  }, []);

  const persist = useCallback((nextDraft: PurchaseOrderDraft) => {
    setDraft(nextDraft);
    saveDraft(nextDraft);
  }, []);

  const addItem = useCallback(
    (item: CatalogItem) => {
      const result = addItemToDraft(draft, item);
      if (result.ok) persist(result.draft);
      setMessage(result.message);
      return result;
    },
    [draft, persist]
  );

  const setQuantity = useCallback(
    (itemId: string, quantity: number) => {
      persist(updateDraftQuantity(draft, itemId, quantity));
    },
    [draft, persist]
  );

  const setHeader = useCallback(
    (header: DraftHeader) => {
      persist(updateDraftHeader(draft, header));
    },
    [draft, persist]
  );

  const resetDraft = useCallback(() => {
    const empty = createEmptyDraft();
    persist(empty);
    setMessage(null);
  }, [persist]);

  return {
    draft,
    hydrated,
    message,
    addItem,
    setQuantity,
    setHeader,
    resetDraft,
    clearMessage: () => setMessage(null)
  };
}
