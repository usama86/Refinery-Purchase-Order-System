"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DraftSummaryCard } from "@/components/draft/draft-summary-card";
import { WorkflowStepper } from "@/components/draft/workflow-stepper";
import { FormField } from "@/components/forms/form-field";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useDraft } from "@/lib/use-draft";
import {
  draftHeaderSchema,
  type DraftHeaderFormValues
} from "@/lib/validations";

const paymentTerms = ["Net 30", "Net 45", "Net 60", "Due on receipt"];

export function HeaderForm() {
  const router = useRouter();
  const { draft, hydrated, setHeader } = useDraft();
  const form = useForm<DraftHeaderFormValues>({
    resolver: zodResolver(draftHeaderSchema),
    defaultValues: draft.header,
    mode: "onBlur"
  });

  useEffect(() => {
    if (hydrated) form.reset(draft.header);
  }, [draft.header, form, hydrated]);

  if (hydrated && draft.lines.length === 0) {
    return (
      <EmptyState
        title="No line items in draft"
        description="Select at least one catalog item before entering purchase order header details."
        action={
          <Button asChild>
            <a href="/catalog">Browse catalog</a>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Draft header"
        title="Confirm request details"
        description="Complete the commercial metadata before reviewing line items and submitting the purchase order."
      />
      <WorkflowStepper currentStep={1} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <form
          className="rounded-lg border bg-card p-6 shadow-sm"
          onSubmit={form.handleSubmit(async (values) => {
            await setHeader(values);
            router.push("/draft/review");
          })}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Requestor"
              htmlFor="requestor"
              error={form.formState.errors.requestor?.message}
            >
              <Input id="requestor" {...form.register("requestor")} />
            </FormField>
            <FormField
              label="Cost center"
              htmlFor="costCenter"
              error={form.formState.errors.costCenter?.message}
            >
              <Input id="costCenter" {...form.register("costCenter")} />
            </FormField>
            <FormField
              label="Needed-by date"
              htmlFor="neededBy"
              error={form.formState.errors.neededBy?.message}
            >
              <Input id="neededBy" type="date" {...form.register("neededBy")} />
            </FormField>
            <FormField
              label="Payment terms"
              htmlFor="paymentTerms"
              error={form.formState.errors.paymentTerms?.message}
            >
              <Select
                value={form.watch("paymentTerms")}
                onValueChange={(value) =>
                  form.setValue("paymentTerms", value, {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              >
                <SelectTrigger id="paymentTerms">
                  <SelectValue placeholder="Payment terms" />
                </SelectTrigger>
                <SelectContent>
                {paymentTerms.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" asChild>
              <a href="/catalog">Back to catalog</a>
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Continue to review
            </Button>
          </div>
        </form>
        <aside>
          <DraftSummaryCard
            draft={draft}
            ctaHref="/draft/review"
            ctaLabel="Review draft"
          />
        </aside>
      </div>
    </div>
  );
}
