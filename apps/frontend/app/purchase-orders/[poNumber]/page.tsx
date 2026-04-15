import { PoDetailPage } from "@/components/po/po-detail-page";

export default function PurchaseOrderDetailRoute({
  params
}: {
  params: { poNumber: string };
}) {
  return <PoDetailPage poNumber={params.poNumber} />;
}
