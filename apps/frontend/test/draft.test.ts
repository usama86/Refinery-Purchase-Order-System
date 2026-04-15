import { describe, expect, it } from "vitest";
import { addItemToDraft, createEmptyDraft, updateDraftQuantity } from "@/lib/draft";
import { catalogItems } from "@/lib/catalog";

describe("draft supplier lock", () => {
  it("locks supplier from the first item and increments duplicate quantities", () => {
    const item = catalogItems.find((candidate) => candidate.supplier === "Flexitallic")!;
    const first = addItemToDraft(createEmptyDraft(), item);

    expect(first.ok).toBe(true);
    expect(first.draft.supplier).toBe("Flexitallic");

    const second = addItemToDraft(first.draft, item);
    expect(second.ok).toBe(true);
    expect(second.draft.lines[0].quantity).toBe(2);
  });

  it("blocks items from a different supplier", () => {
    const flexitallic = catalogItems.find((item) => item.supplier === "Flexitallic")!;
    const flowserve = catalogItems.find((item) => item.supplier === "Flowserve")!;
    const locked = addItemToDraft(createEmptyDraft(), flexitallic);
    const mismatch = addItemToDraft(locked.draft, flowserve);

    expect(mismatch.ok).toBe(false);
    expect(mismatch.draft.lines).toHaveLength(1);
    expect(mismatch.message).toContain("locked to Flexitallic");
  });

  it("clears supplier lock when final line is removed", () => {
    const item = catalogItems[0];
    const added = addItemToDraft(createEmptyDraft(), item);
    const emptied = updateDraftQuantity(added.draft, item.id, 0);

    expect(emptied.lines).toHaveLength(0);
    expect(emptied.supplier).toBeNull();
  });
});
