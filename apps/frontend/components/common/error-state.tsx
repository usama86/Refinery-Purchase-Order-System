import { AlertTriangle } from "lucide-react";
import { Alert } from "@/components/ui/alert";

export function ErrorState({
  title,
  message,
  action
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <Alert role="alert" variant="destructive" className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </Alert>
  );
}
