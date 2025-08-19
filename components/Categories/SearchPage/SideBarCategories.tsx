"use client"

import Link from "next/link"
import { CategoryModel } from "@/types/category"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Filter, Badge } from "lucide-react"
import { Button } from "@/components/ui/button"


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
  )
}

export default function SideBarCategories(props: ProductFiltersProps) {
  return (
    <>
      <div className="hidden lg:block bg-brand-muted dark:bg-brand-muteddark sticky top-6 h-fit max-h-[calc(100vh-3rem)] overflow-y-auto border rounded-lg bg-card p-6 shadow-sm">
        <SidebarContent {...props} />
      </div>

      <Sheet>
        <SheetTrigger asChild className="bg-brand-muted dark:bg-brand-muteddark">
          <Button variant="outline" className="lg:hidden relative">
            <Filter className="h-4 w-4 mr-2" />
            კატეგორიები
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0 bg-brand-muted dark:bg-brand-muteddark">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle>კატეგორიები</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            <SidebarContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
