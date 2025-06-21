import { CategoriesTable } from "@/components/admin/categories-table"

export default function CategoriesPage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your products with categories and subcategories</p>
        </div>
        <CategoriesTable />
      </div>
  )
}
