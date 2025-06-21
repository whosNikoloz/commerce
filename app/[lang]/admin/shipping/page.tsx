import { ShippingTable } from "@/components/admin/shipping-table"

export default function ShippingPage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping</h1>
          <p className="text-muted-foreground">Manage shipping methods, zones, and delivery options</p>
        </div>
        <ShippingTable />
      </div>
  )
}
