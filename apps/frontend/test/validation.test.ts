import { describe, expect, it } from "vitest";
import { draftHeaderSchema } from "@/lib/validations";

describe("draft header validation", () => {
  it("accepts a valid buyer header", () => {
    const parsed = draftHeaderSchema.safeParse({
      requestor: "Alex Morgan",
      costCenter: "CC-1234",
      neededBy: "2026-05-01",
      paymentTerms: "Net 30"
    });

    expect(parsed.success).toBe(true);
  });

  it("requires the assignment cost-center format", () => {
    const parsed = draftHeaderSchema.safeParse({
      requestor: "A",
      costCenter: "1234",
      neededBy: "",
      paymentTerms: ""
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.costCenter?.[0]).toContain("CC-1234");
    }
  });
});
