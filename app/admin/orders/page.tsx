import { getOrders } from "@/app/actions";
import OrdersClient from "@/components/admin/orders-client";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return <OrdersClient initialOrders={orders} />;
}
