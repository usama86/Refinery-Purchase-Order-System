"use client";

import { useCallback, useEffect, useState } from "react";
import { createEmptyDraft } from "@/lib/draft";
import {
  addDraftLine,
  getOrCreateDraft,
  updateDraftHeader,
  updateDraftLineQuantity
} from "@/lib/procurement";
import type { CatalogItem, DraftHeader, PurchaseOrderDraft } from "@/lib/types";

export type AddLineResult =
  | { ok: true; draft: PurchaseOrderDraft; message: string }
  | { ok: false; draft: PurchaseOrderDraft; message: string };

export function useDraft() {
  const [draft, setDraft] = useState<PurchaseOrderDraft>(() => createEmptyDraft());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    getOrCreateDraft()
      .then((nextDraft) => {
        if (active) setDraft(nextDraft);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const addItem = useCallback(
    async (item: CatalogItem): Promise<AddLineResult> => {
      if (!draft.id) {
        return {
          ok: false,
          draft,
          message: "Draft is still initializing. Try again in a moment."
        };
      }

      try {
        const existing = draft.lines.some((line) => line.itemId === item.id);
        const nextDraft = await addDraftLine(draft.id, item.id);
        setDraft(nextDraft);
        return {
          ok: true,
          draft: nextDraft,
          message: existing ? "Quantity increased." : "Item added to draft."
        };
      } catch (error) {
        return {
          ok: false,
          draft,
          message:
            error instanceof Error
              ? error.message
              : "The item could not be added to the draft."
        };
      }
    },
    [draft]
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const nextDraft = await updateDraftLineQuantity(
        draft,
        itemId,
        Math.max(0, Math.floor(quantity))
      );
      setDraft(nextDraft);
    },
    [draft]
  );

  const setHeader = useCallback(
    async (header: DraftHeader) => {
      if (!draft.id) throw new Error("Draft is still initializing.");
      const nextDraft = await updateDraftHeader(draft.id, header);
      setDraft(nextDraft);
    },
    [draft.id]
  );

  const resetDraft = useCallback(() => {
    const empty = createEmptyDraft();
    setDraft(empty);
  }, []);

  return {
    draft,
    hydrated,
    addItem,
    setQuantity,
    setHeader,
    resetDraft
  };
}

