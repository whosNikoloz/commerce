"use client"

import Link from "next/link"
import { CategoryModel } from "@/types/category"

type SubcategoryItem = CategoryModel & { count?: number }

type ProductFiltersProps = {
  categorys: SubcategoryItem[]
  buildSubHref: (sub: CategoryModel) => string
}
function SidebarContent({
  categorys,
  buildSubHref,
}: ProductFiltersProps) {

  return (
    <div className="hidden lg:block bg-brand-muted dark:bg-brand-muteddark sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto border rounded-lg bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">კატეგორიები</h2>
          <div className="space-y-2">
            {categorys.map(sub => (
              <Link
                key={sub.id}
                href={buildSubHref(sub)}
                className="flex items-center justify-between w-full p-2 text-left rounded-md hover:bg-muted transition-colors"
              >
                <span className="text-sm">{sub.name}</span>
                {/* <span className="text-xs text-muted-foreground">({sub.count ?? 0})</span> */}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SidebarContent