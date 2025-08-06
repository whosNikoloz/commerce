import { ProductsTable } from "@/components/admin/products-table"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light">Products</h1>
        <p className="dark:text-text-muteddark text-text-muted">Manage your product inventory and visibility settings</p>
      </div>
      <ProductsTable />
    </div>
  )
}
