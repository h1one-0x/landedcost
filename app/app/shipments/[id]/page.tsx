import { redirect } from "next/navigation";

interface ShipmentDetailProps {
  params: Promise<{ id: string }>;
}

export default async function ShipmentDetailPage({ params }: ShipmentDetailProps) {
  const { id } = await params;
  redirect(`/app/new-shipment?load=${id}`);
}
