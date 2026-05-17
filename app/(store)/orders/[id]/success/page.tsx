import OrderSuccessClient from "./OrderSuccessClient";

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderSuccessClient id={id} />;
}
