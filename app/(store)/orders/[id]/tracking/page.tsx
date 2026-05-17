import OrderTrackingClient from "./OrderTrackingClient";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderTrackingClient id={id} />;
}
