import { OrdersTable } from "@/components/admin/orders-table"

export default function OrdersPage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Track and manage customer orders and fulfillment</p>
        </div>
        <OrdersTable />
      </div>
  )
}
