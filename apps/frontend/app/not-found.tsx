import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="The requested refinery workflow page does not exist."
      action={
        <Button asChild>
          <Link href="/catalog">Return to catalog</Link>
        </Button>
      }
    />
  );
}
