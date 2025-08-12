import { BrandsTable } from "@/components/admin/brand/brands-table";

export default function BrandsPage() {
  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light ">Products</h1>
      </div>
      <BrandsTable />
    </div>
  )
}
