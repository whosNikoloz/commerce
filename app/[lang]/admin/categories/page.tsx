import { CategoriesTable } from "@/components/admin/categories-table"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-text-lightdark text-text-light ">Categories</h1>
      </div>
      <CategoriesTable />
    </div>
  )
}
