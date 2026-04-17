import { PoDetailPage } from "@/components/po/po-detail-page";

export default async function PurchaseOrderDetailRoute({
  params
}: {
  params: Promise<{ poNumber: string }>;
}) {
  const { poNumber } = await params;
  return <PoDetailPage poNumber={poNumber} />;
}
