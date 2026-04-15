"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="The purchase order workspace could not load"
      message={error.message || "Refresh the page or retry the last action."}
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}
