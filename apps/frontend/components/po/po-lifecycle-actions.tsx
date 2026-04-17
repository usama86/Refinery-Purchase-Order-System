"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PackageCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/common/error-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { transitionPurchaseOrder } from "@/lib/procurement";
import type { PurchaseOrder } from "@/lib/types";

type LifecycleAction = "approve" | "reject" | "fulfill";

export function PoLifecycleActions({ order }: { order: PurchaseOrder }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (action: LifecycleAction) => transitionPurchaseOrder(order, action),
    onSuccess: (nextOrder) => {
      queryClient.setQueryData(["purchase-order", order.poNumber], nextOrder);
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", order.poNumber] });
      toast.success("Purchase order updated.", {
        description: `${nextOrder.poNumber} is now ${nextOrder.status.toLowerCase()}.`
      });
    }
  });

  if (order.status === "Rejected" || order.status === "Fulfilled") return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        {order.status === "Submitted" ? (
          <>
            <LifecycleActionDialog
              action="approve"
              title="Approve purchase order?"
              description={`Approve ${order.poNumber} and move it into the approved queue. This action will be recorded in the status history.`}
              confirmLabel="Approve order"
              disabled={mutation.isPending}
              isPending={mutation.isPending}
              onConfirm={(action) => mutation.mutate(action)}
              trigger={
                <Button disabled={mutation.isPending}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {mutation.isPending ? "Updating..." : "Approve"}
                </Button>
              }
            />
            <LifecycleActionDialog
              action="reject"
              title="Reject purchase order?"
              description={`Reject ${order.poNumber} and stop this purchase order from progressing. The requester will need to revise or recreate the order.`}
              confirmLabel="Reject order"
              disabled={mutation.isPending}
              destructive
              isPending={mutation.isPending}
              onConfirm={(action) => mutation.mutate(action)}
              trigger={
                <Button
                  variant="destructive"
                  className="shadow-sm"
                  disabled={mutation.isPending}
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Reject
                </Button>
              }
            />
          </>
        ) : null}
        {order.status === "Approved" ? (
          <LifecycleActionDialog
            action="fulfill"
            title="Mark purchase order fulfilled?"
            description={`Mark ${order.poNumber} as fulfilled after the approved order has been completed. This closes the lifecycle.`}
            confirmLabel="Mark fulfilled"
            disabled={mutation.isPending}
            isPending={mutation.isPending}
            onConfirm={(action) => mutation.mutate(action)}
            trigger={
              <Button disabled={mutation.isPending}>
                <PackageCheck className="h-4 w-4" aria-hidden="true" />
                {mutation.isPending ? "Updating..." : "Fulfill"}
              </Button>
            }
          />
        ) : null}
      </div>
      {mutation.isError ? (
        <ErrorState
          title="Status update failed"
          message={
            mutation.error instanceof Error
              ? mutation.error.message
              : "The purchase order status could not be updated."
          }
        />
      ) : null}
    </div>
  );
}

function LifecycleActionDialog({
  action,
  title,
  description,
  confirmLabel,
  destructive = false,
  disabled,
  isPending,
  onConfirm,
  trigger
}: {
  action: LifecycleAction;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  disabled: boolean;
  isPending: boolean;
  onConfirm: (action: LifecycleAction) => void;
  trigger: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => onConfirm(action)}
            className={
              destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
            }
          >
            {isPending ? "Updating..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
